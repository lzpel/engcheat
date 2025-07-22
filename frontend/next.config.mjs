// from github.com/lzpel/surfic
// next.config.tsはworkflowが読み込めない。mjsが回避策
const PATH_PREFIX=process.env.NEXT_PUBLIC_REPO//github.ioで公開するならこちらprocess.env.NEXT_PUBLIC_REPO<->独自ドメインを立てるならundefined
const nextConfig = {
	output: 'export', // 静的サイトexport<->動的サイトstandalone
	basePath: PATH_PREFIX ? `/${PATH_PREFIX}` : undefined,
	assetPrefix: PATH_PREFIX ? `/${PATH_PREFIX}/` : undefined,
	env: {
		NEXT_PUBLIC_PREFIX: PATH_PREFIX ? `/${PATH_PREFIX}` : "",
	},
	webpack: (config, options) => {
		config.experiments = {
			...config.experiments,
			asyncWebAssembly: true,
			syncWebAssembly: true,
			layers: true,
		};
		config.output.webassemblyModuleFilename = (options.isServer ? '../' : '') + 'static/wasm/webassembly.wasm';
		return config;
	}
};

export default nextConfig;