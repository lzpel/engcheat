install: frontend-install

generate: frontend-generate
	rm -rf public && mkdir -p public
	cp -rf ../data/. ../out/paper.pdf ./public/
run:
	npm run dev

deploy:
	npm run build

###########################################################################
# make install + make generateで大体良い感じのフロントエンドが書けるmakefile
# tailwind css で material ui風のpaletteを導入
frontend-install:
	npm install -D @tailwindcss/postcss tailwindcss
frontend-generate:
	npm install
	# 無視するファイルを.gitignoreに追加
	sed -i -e '/##/q' .gitignore || true && printf "##\nAGENTS.md\nCLAUDE.md\n*.config.*" >> .gitignore
	# 設定ファイルを作成
	echo "$${next_config_ts}" > ./next.config.ts
	echo "$${postcss_config_mjs}" > ./postcss.config.mjs
	echo "$${tailwindcss_config_mjs}" > ./tailwind.config.mjs
	echo "$${agents_md}" | tee ./CLAUDE.md ./AGENTS.md > /dev/null
define agents_md
# Frontend Rules

## Component Declaration
- UI components must use `export function` or `export default function`. Never assign functions to `const`.
- Function arguments must be declared as `(props: Type)` and accessed via `props.xxx`. Destructuring in the parameter list `({ xxx }: Type)` is prohibited.

## Props Design
- Define prop types so that event handlers and values can be injected from the parent when needed.

## Colors
- Never hardcode colors. Use the palette defined in `tailwind.config.mjs`.

## stateless_ui/ Directory
- Files under `stateless_ui/` define appearance only, not behavior. `useState`, `useEffect`, `useRef`, and other hooks are prohibited.
- Each file must define `export function Sandbox()` that renders all UI components defined in that file for visual review.
- Each file's `<Filename.Sandbox />` must be placed in `app/sandbox/page.tsx`.
endef
export

define next_config_ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "export",
	basePath: $(if $(REPONAME),"/$(REPONAME)",undefined),
	assetPrefix: $(if $(REPONAME),"/$(REPONAME)/",undefined),
	env: {
		NEXT_PUBLIC_PREFIX: "$(if $(REPONAME),/$(REPONAME))",
		SERVER_URL: $(if $(REPONAME),"https://d3l2x153v6axn.cloudfront.net",undefined)
	},
	images: {
		unoptimized: true,
	},
	experimental: {
		externalDir: true,
	},
}
;export default nextConfig;
endef
export

define postcss_config_mjs
const config = {
	plugins: {
		"@tailwindcss/postcss": {},
	},
};
;export default config;
endef
export

define tailwindcss_config_mjs
/** @type {import('tailwindcss').Config} */
// material ui風のpaletteを導入
export default {
	content: [
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			/**
			 * 重要:
			 * - CSS変数は `R G B` (例: "25 118 210") の形式で持つ想定
			 * - Tailwind側は `rgb(var(--...)/<alpha-value>)` を参照
			 *
			 * 例: --palette-primary-main: 25 118 210;
			 */
			colors: {
				// ===== Tone (primary/secondary/...) =====
				primary: {
					main: "rgb(var(--palette-primary-main) / <alpha-value>)",
					contrast: "rgb(var(--palette-primary-contrastText) / <alpha-value>)",
					light: "rgb(var(--palette-primary-light) / <alpha-value>)",
					dark: "rgb(var(--palette-primary-dark) / <alpha-value>)",
				},
				secondary: {
					main: "rgb(var(--palette-secondary-main) / <alpha-value>)",
					contrast: "rgb(var(--palette-secondary-contrastText) / <alpha-value>)",
					light: "rgb(var(--palette-secondary-light) / <alpha-value>)",
					dark: "rgb(var(--palette-secondary-dark) / <alpha-value>)",
				},
				error: {
					main: "rgb(var(--palette-error-main) / <alpha-value>)",
					contrast: "rgb(var(--palette-error-contrastText) / <alpha-value>)",
					light: "rgb(var(--palette-error-light) / <alpha-value>)",
					dark: "rgb(var(--palette-error-dark) / <alpha-value>)",
				},
				warning: {
					main: "rgb(var(--palette-warning-main) / <alpha-value>)",
					contrast: "rgb(var(--palette-warning-contrastText) / <alpha-value>)",
					light: "rgb(var(--palette-warning-light) / <alpha-value>)",
					dark: "rgb(var(--palette-warning-dark) / <alpha-value>)",
				},
				info: {
					main: "rgb(var(--palette-info-main) / <alpha-value>)",
					contrast: "rgb(var(--palette-info-contrastText) / <alpha-value>)",
					light: "rgb(var(--palette-info-light) / <alpha-value>)",
					dark: "rgb(var(--palette-info-dark) / <alpha-value>)",
				},
				success: {
					main: "rgb(var(--palette-success-main) / <alpha-value>)",
					contrast: "rgb(var(--palette-success-contrastText) / <alpha-value>)",
					light: "rgb(var(--palette-success-light) / <alpha-value>)",
					dark: "rgb(var(--palette-success-dark) / <alpha-value>)",
				},

				// ===== text/background/divider/action =====
				text: {
					primary: "rgb(var(--palette-text-primary) / <alpha-value>)",
					secondary: "rgb(var(--palette-text-secondary) / <alpha-value>)",
					disabled: "rgb(var(--palette-text-disabled) / <alpha-value>)",
				},
				background: {
					default: "rgb(var(--palette-background-default) / <alpha-value>)",
					paper: "rgb(var(--palette-background-paper) / <alpha-value>)",
				},
				divider: "rgb(var(--palette-divider) / <alpha-value>)",
				action: {
					hover: "rgb(var(--palette-action-hover) / <alpha-value>)",
					selected: "rgb(var(--palette-action-selected) / <alpha-value>)",
					disabled: "rgb(var(--palette-action-disabled) / <alpha-value>)",
					disabledBackground:
						"rgb(var(--palette-action-disabledBackground) / <alpha-value>)",
					focus: "rgb(var(--palette-action-focus) / <alpha-value>)",
				},
			},
		},
	},
	darkMode: ["class"], // palette.mode と合わせるなら class 運用が安定
	plugins: [],
};
endef
export