# Copyright (C) 2026  Henrique Almeida
# This file is part of Portfolio.
#
# Portfolio is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published
# by the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# Portfolio is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with Portfolio.  If not, see <https://www.gnu.org/licenses/>.

################################################################################
# A Dockerfile to build a development container for Portfolio.

########################################
# Node.js versions
ARG NODE_VERSION="24.21.0"
ARG NODE_DISTRO="node-v${NODE_VERSION}-linux-x64"

########################################
# Android SDK versions
ARG ANDROID_CMDLINE_TOOLS_VERSION="11076708"
ARG ANDROID_BUILD_TOOLS_VERSION="36.0.0"
ARG ANDROID_PLATFORM_VERSION="android-36"

########################################
# Runtime user configuration
# dev, because dev-base bakes the user it creates and every repository
# shares that image.
ARG USER="dev"
ARG UID="1000"
ARG GID="1000"
ARG CARGO_HOME="/home/${USER}/.local/share/cargo"

# A caching mirror on the network this is built on, so a package is fetched from
# the internet once rather than once per build. Empty by default, which is what
# CI uses: its runners have no route to a LAN mirror and go straight to Debian.
ARG APT_MIRROR=""

################################################################################
# Shared builder image
FROM debian:13-slim@sha256:a99cfc517144bc59b1978475ec53b46ecabec7e43635402ee5b77cc54cd1b20a AS builder-base

ARG APT_MIRROR
RUN if [ -n "${APT_MIRROR}" ]; then \
    sed -i "s|http://deb.debian.org|${APT_MIRROR}|g" \
      /etc/apt/sources.list.d/debian.sources; \
  fi

RUN apt-get update && apt-get install -y --no-install-recommends \
  gnupg \
  tar \
  xz-utils \
  unzip \
  wget

################################################################################
# Node.js stage
FROM builder-base AS node-stage
ARG NODE_VERSION
ARG NODE_DISTRO

########################################
# Download and verify Node.js
ADD "https://nodejs.org/dist/v${NODE_VERSION}/SHASUMS256.txt.asc" /tmp/
ADD "https://github.com/nodejs/release-keys/raw/HEAD/gpg/pubring.kbx" /tmp/node-keyring.kbx
ADD "https://nodejs.org/dist/v${NODE_VERSION}/${NODE_DISTRO}.tar.xz" /tmp/

RUN gpg --batch --yes --no-default-keyring --keyring /tmp/node-keyring.kbx \
  --trust-model always --decrypt /tmp/SHASUMS256.txt.asc >/tmp/SHASUMS256.txt && \
  cd /tmp && grep "${NODE_DISTRO}.tar.xz" SHASUMS256.txt | sha256sum -c -

########################################
# Install Node.js to /opt/node
RUN mkdir -p "/rootfs/opt/node" "/rootfs/usr/local/bin" && \
  tar -xf "/tmp/${NODE_DISTRO}.tar.xz" -C "/rootfs/opt/node" --strip-components=1

# Symlink node binaries to /usr/local/bin
RUN cd "/rootfs/usr/local/bin" && ln -s ../../../opt/node/bin/* .

################################################################################
# Debian main stage
FROM h3nc4/dev-base:debian-13@sha256:882dbbaafb92a2b366b54dbed2aca6b2531f01fb89095b5b7889cd930ad68ec2 AS main

# dev-base ends as the dev user, and the steps below need root.
USER root

# Copy features from other stages
COPY --from=node-stage /rootfs/ /

########################################
# Upgrade npm to the latest version
RUN npm install -g npm@latest

########################################
# Clean cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*
RUN rm -rf /var/cache/* /var/log/* /tmp/* /root/.npm

################################################################################
# Final squash image.
FROM scratch AS final
ARG USER
ENV USER="${USER}" \
  MANPATH="/opt/node/share/man:" \
  LANG="en_US.UTF-8" \
  LC_ALL="en_US.UTF-8"

COPY --from=main / /

USER "${USER}"

ENTRYPOINT ["/usr/bin/tini", "--", "/usr/local/bin/entrypoint.sh"]
CMD ["/usr/bin/sleep", "infinity"]
