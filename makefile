MAKEDIRS := frontend 
SHELL := bash
create:
	bash -c "$${create}"
generate:
	bash -c "$${make_dirs}"
run:
	parallel=1 bash -c "$${make_dirs}"
deploy:
	bash -c "$${make_dirs}"
clean:
	bash -c "$${make_dirs}"
large:
	find . -type f -not -path "./.git/*" -not -path "**/node_modules/*" -not -path "**/target/*" -not -path "**/.next/*" -exec du -b {} + | sort -nr
search-%:
	@git grep --color -r --text -n '$*' .
define make_dirs
if [ -n "$$parallel" ]; then
	trap "kill 0" EXIT; for d in $(MAKEDIRS); do $(MAKE) -C "$$d" "$@" & done; wait
else
	time echo $(MAKEDIRS) | xargs -n 1 | xargs -IX sh -c "$(MAKE) -C X $@ || exit 255"
fi
endef
export make_dirs
define create
install -D /dev/stdin ./.gitignore <<'EOF'
out/
target/
EOF
install -D /dev/stdin ./frontend/makefile <<'EOF'
%:
	@echo "Unknown target '$$@' skipping"
create:
	cat <<'EOM'
generate:
	npm install
run:
	npm run dev
deploy:
	npm run build
clean:
	npm cache clean --force
EOF
install -D /dev/stdin ./frontend/MEMO.md <<'EOF'
$ npx create-next-app@latest frontend
√ Would you like to use TypeScript? ... No / Yes
√ Would you like to use ESLint? ... No / Yes
√ Would you like to use Tailwind CSS? ... No / Yes
√ Would you like your code inside a `src/` directory? ... No / Yes
√ Would you like to use App Router? (recommended) ... No / Yes
√ Would you like to use Turbopack for `next dev`? ... No / Yes
√ Would you like to customize the import alias (`@/*` by default)? ... No / Yes
Creating a new Next.js app in C:\Users\smith\Downloads\engcheat\frontend.

Using npm.

Initializing project with template: app


Installing dependencies:
- react
- react-dom
- next

Installing devDependencies:
- typescript
- @types/node
- @types/react
- @types/react-dom
- eslint
- eslint-config-next
- @eslint/eslintrc


added 305 packages, and audited 306 packages in 21s

131 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
Success! Created frontend at C:\Users\smith\Downloads\engcheat\frontend
EOF
endef
export create