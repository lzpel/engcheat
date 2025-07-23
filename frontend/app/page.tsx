import find, {FoundEntry, readDirentTextSync} from "@/src/find";
import AudioPlayer, {Audio} from "@/app/AudioPlayer";
export default function Home() {
	const audiolist=find("./public/out", false)
	.map(v=>{
		const path=uriFromEntry(v)
		const r: Audio={
			path: `${path}/out.mp3`,
			config: readDirentTextSync(v, "out.json")
		}
		return r
	})
	return <>
		<AudioPlayer audiolist={audiolist}/>
	</>
}
function uriFromEntry(entry: FoundEntry):string{
	const path=entry.parentPath.replace(/(?:.*\/)?public\//, '');
	return encodeURI(`${process.env.NEXT_PUBLIC_PREFIX}/${path}/${entry.name}`)
}