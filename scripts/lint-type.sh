#!/bin/sh
#
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


# Refuses an arbitrary type size such as text-[10px].
#
# The Tailwind scale is rem based, so a step follows whatever font size the reader has set.
# A px value ignores it, and the smallest text on the page is where that matters most.
set -eu

cd "$(dirname "$0")/../"

if found="$(grep -rnE 'text-\[[0-9.]+(px|rem)\]' src/)"; then
  echo "$0: arbitrary type sizes, use a scale step such as text-xs or text-sm:" >&2
  printf '%s\n' "${found}" >&2
  exit 1
fi
