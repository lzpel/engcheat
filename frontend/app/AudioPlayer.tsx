"use client"
import getDaysFromDate from "@/src/daysFromDate";
import React from "react";
import { useState } from "react";
import Switch, { SwitchState } from "@/app/Swtich";
import Script from "./Script";
import {fullHeightFlex, InnerScroll} from "@/src/fullHeight";

type Action={
	index: number,
	muted: boolean
}
export type Audio={
	path: string
	config: string
}
export default function AudioPlayer(props: {
	audiolist: Audio[]
}){
	const [fontSize, setFontSize] = useState(16); // 初期サイズ 16px
	const [switchState, setSwitchState] = useState<SwitchState>(true);
	const [internalState, setInternalState] = useState<number>(0);
	const action=actionFromInternalState(internalState, props.audiolist);
	
	React.useEffect(() => {
		const checkPlayingAudios = () => {
			const audios = Array.from(document.querySelectorAll('audio')) as HTMLAudioElement[];
			const playing = audios.filter(isAudioPlaying);
			audios.forEach(v=>{
				//必要な再生を開始する
				if(v.id==idFromIndex(action.index)){
					if(isAudioPlaying(v)){
						v.playbackRate=action.muted?0.6:1
						scrollToNormalizedPosition("script_div", v.currentTime/v.duration)
					}else{
						v.play()
						v.currentTime=0
					}
				}
				//必要な再生を開始する
				if(v.id!=idFromIndex(action.index) && isAudioPlaying(v)==true)v.pause()
			})
			if(playing.every(v=>v.id!=idFromIndex(action.index))){
				audios.filter(v=>v.id==idFromIndex(action.index)).forEach(v=>v.play())
			}
			//不必要な再生を止める
			playing.filter(v=>v.id!=idFromIndex(action.index)).forEach(v=>{
				v.pause()
			})
			//なんも再生されてないなら次に進める
			if(playing.length==0){
				nextState(setInternalState,+1)
			}
		};
		const interval = setInterval(checkPlayingAudios, 1000); // 0.5秒ごとにチェック
		return () => clearInterval(interval);
	}, [internalState]);
	const audiolist=props.audiolist.map((v, index)=><div key={index}>
		<div>{v.path}</div>
		<audio id={idFromIndex(index)} controls muted={action.index==index && action.muted}>
			<source src={v.path} type="audio/mpeg"/>
			This browser do not support audio element
		</audio>
	</div>)
	const script=props.audiolist.filter((_,index)=>index==action.index).map((v,index)=>{
		return <Script key={v.path} fontSize={fontSize} json={JSON.parse(v.config)}/>
	})
	return <div style={fullHeightFlex}>
		<div style={InnerScroll} hidden={switchState==true}>
			<table>
				<thead>
					<tr>
					<th scope="col">#</th>
					<th scope="col">News</th>
					<th scope="col">Audio</th>
					</tr>
				</thead>
				<tbody>
				{props.audiolist.map((v, index)=>
					<tr key={index} style={(action.index===index)?{backgroundColor:"#aaffaa"}:undefined}>
						<th scope="row">{index}</th>
						<td>{v.path}</td>
						<td>
							<audio id={idFromIndex(index)} controls muted={action.index==index && action.muted}>
								<source src={v.path} type="audio/mpeg"/>
								This browser do not support audio element
							</audio>
						</td>
					</tr>
				)}
				</tbody>
			</table>
		</div>
		<div id="script_div" style={InnerScroll} hidden={switchState==false}>
			{script}
		</div>
		<div style={{position: "sticky", bottom:0, left: 0}}>
			<span>Controller</span>
			<Switch value={switchState} setValue={setSwitchState}>show script</Switch>
			<button onClick={()=>nextState(setInternalState, -1)}>{"<< prev"}</button>
			<button onClick={()=>nextState(setInternalState, +1)}>{"next >>"}</button>
			<span>font {fontSize}px</span>
			<input
				type="range"
				min={10}
				max={72}
				value={fontSize}
				onChange={(e) => setFontSize(Number(e.target.value))}
			/>
			offset={offset()} state({internalState})={JSON.stringify(action)}
		</div>
	</div>
}
function scrollToNormalizedPosition(id: string, ratio: number) {
	const div = document.getElementById(id);
	if (!div) return;
	// 範囲を0〜1にクリップ
	const clamped = Math.max(0, Math.min(1, ratio));
	// ドキュメント全体のスクロール可能な高さ
	const scrollableHeight = div.scrollHeight - div.clientHeight;
	if (scrollableHeight <= 0) return;
	const targetY = clamped * scrollableHeight;
	div.scrollTo({ top: targetY, behavior: 'smooth' });
}
function isAudioPlaying(audio: HTMLAudioElement): boolean{
	return !audio.paused && !audio.ended && audio.error == null
}
function idFromIndex(index: number){
	return `audio${index}`
}
function offset(): number{
	return Math.max(getDaysFromDate(new Date("2025-07-24")),0)
}
function nextState(setState: React.Dispatch<React.SetStateAction<number>>, offset: 1|-1){
	const period=3*2;
	setState(v=>(v+offset+period)%period)
}
function actionFromInternalState(internalState: number, media: Audio[]):Action{
	const ret:Action={
		index: (offset()+Math.floor(internalState/2))%media.length,
		muted: internalState%2!=0
	}
	return ret
}