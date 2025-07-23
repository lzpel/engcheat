import { find } from "@/src/find";

export default function Home() {
	const audio_list=find("./public/out/", false, {
		type_d: true
	})
	return <>
	{audio_list.map(v=>encodeURI(`${process.env.NEXT_PUBLIC_PREFIX}/out/${v.name}/out.mp3`)).map(v=>
		<>
			<div>{v}</div>
			<audio controls>
				<source src={v} type="audio/mpeg"/>
				This browser do not support audio element
			</audio>
		</>
	)}
	</>
}
