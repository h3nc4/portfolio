/*
 * Copyright (C) 2026  Henrique Almeida
 * This file is part of Portfolio.
 *
 * Portfolio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Portfolio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Portfolio.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * Standard footer with copyright notice.
 */
export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-24 border-t border-zinc-800 pt-8 text-center text-sm text-zinc-400">
      <a
        href="https://github.com/h3nc4/portfolio"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:no-underline"
      >
        <p>© {currentYear} Henrique Almeida.</p>
        <p>Because knowledge should be free.</p>
      </a>
    </footer>
  )
}
