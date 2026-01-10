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
# A Dockerfile to build a runtime container for Portfolio.

################################################################################
# Build stage
FROM h3nc4/portfolio-dev:latest AS portfolio-builder

USER 0:0
WORKDIR /app

# Install npm dependencies
COPY "package.json" "package-lock.json" ./
RUN npm ci

# Copy source code
COPY "README.md" "LICENSE" *.js *.json *.ts *.html ./
COPY src/ src/
COPY public/ public/

# Build app for production
RUN npm run build

# Create root filesystem and compress assets
RUN mkdir -p /rootfs && \
  mv /app/dist /rootfs/static

RUN find /rootfs/static -type f \
  -exec gzip -9 -k "{}" \; \
  -exec brotli --best -k "{}" \;

################################################################################
# Nginx builder stage
FROM busybox:musl AS nginx-builder

COPY --from=h3nc4/nginx-slim / /rootfs/

# Copy and minify nginx config
COPY "nginx.conf" "/rootfs/nginx.conf"
RUN \
  # Remove comments and empty lines
  sed -E '/^[[:space:]]*#/d;/^[[:space:]]*$/d' "/rootfs/nginx.conf" | \
  # Remove all newlines to produce a single-line config
  tr -d '\n' | \
  # Compress consecutive spaces into a single space
  tr -s ' ' >"/rootfs/nginx.conf.min" && \
  mv "/rootfs/nginx.conf.min" "/rootfs/nginx.conf"

################################################################################
# Assemble runtime image
FROM scratch AS assemble

COPY --from=portfolio-builder "/rootfs" "/"
COPY --from=nginx-builder "/rootfs" "/"

################################################################################
# Final squashed image
FROM scratch AS final
ARG VERSION="dev"
ARG COMMIT_SHA="unknown"
ARG BUILD_DATE="unknown"

COPY --from=assemble "/" "/"
USER 65534:65534
CMD ["/nginx", "-c", "/nginx.conf"]

LABEL org.opencontainers.image.title="Portfolio" \
  org.opencontainers.image.description="Personal portfolio of Henrique Almeida" \
  org.opencontainers.image.authors="Henrique Almeida <me@h3nc4.com>" \
  org.opencontainers.image.vendor="Henrique Almeida" \
  org.opencontainers.image.licenses="AGPL-3.0-or-later" \
  org.opencontainers.image.url="https://h3nc4.com" \
  org.opencontainers.image.source="https://github.com/h3nc4/Portfolio" \
  org.opencontainers.image.documentation="https://github.com/h3nc4/Portfolio/blob/main/README.md" \
  org.opencontainers.image.version="${VERSION}" \
  org.opencontainers.image.revision="${COMMIT_SHA}" \
  org.opencontainers.image.created="${BUILD_DATE}" \
  org.opencontainers.image.ref.name="${VERSION}"
