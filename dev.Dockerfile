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
ARG NODE_VERSION="24.13.1"
ARG NODE_DISTRO="node-v${NODE_VERSION}-linux-x64"

########################################
# Android SDK versions
ARG ANDROID_CMDLINE_TOOLS_VERSION="11076708"
ARG ANDROID_BUILD_TOOLS_VERSION="36.0.0"
ARG ANDROID_PLATFORM_VERSION="android-36"

########################################
# Runtime user configuration
ARG USER="portfolio"
ARG UID="1000"
ARG GID="1000"
ARG CARGO_HOME="/home/${USER}/.local/share/cargo"

################################################################################
# Shared builder image
FROM debian:trixie@sha256:2c91e484d93f0830a7e05a2b9d92a7b102be7cab562198b984a84fdbc7806d91 AS builder-base

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
FROM debian:trixie@sha256:2c91e484d93f0830a7e05a2b9d92a7b102be7cab562198b984a84fdbc7806d91 AS main
ARG USER
ARG UID
ARG GID

# Update apt lists
RUN apt-get update -qq

# Gen locale
RUN apt-get install --no-install-recommends -y -qq locales && \
  echo "en_US.UTF-8 UTF-8" >/etc/locale.gen && \
  locale-gen en_US.UTF-8 && \
  update-locale LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8

# Install generic tools
RUN apt-get install --no-install-recommends -y -qq \
  bash-completion \
  ca-certificates \
  curl \
  file \
  git \
  gnupg \
  gosu \
  iputils-ping \
  iproute2 \
  jq \
  less \
  man-db \
  nano \
  net-tools \
  opendoas \
  openssh-client \
  procps \
  shellcheck \
  tini \
  tree \
  wget \
  yq

# Add Docker outside of Docker packages
RUN apt-get install --no-install-recommends -y -qq \
  docker-cli \
  docker-buildx

# Install compression tools
RUN apt-get install --no-install-recommends -y -qq \
  brotli \
  gzip \
  xz-utils

########################################
# Create a non-root developing user and configure doas
RUN addgroup --gid "${GID}" "${USER}"
RUN adduser --uid "${UID}" --gid "${GID}" \
  --shell "/bin/bash" --disabled-password "${USER}"

RUN addgroup --gid 110 docker && usermod -aG docker "${USER}"

RUN printf "permit nopass nolog keepenv %s as root\n" "${USER}" >/etc/doas.conf && \
  chmod 400 /etc/doas.conf && \
  printf "%s\nset -e\n%s\n" "#!/bin/sh" "doas \$@" >/usr/local/bin/sudo && \
  chmod a+rx /usr/local/bin/sudo

COPY scripts/switch-user.sh /usr/local/bin/switch-user.sh
COPY scripts/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/switch-user.sh /usr/local/bin/entrypoint.sh

########################################
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
