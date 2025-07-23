"use client"
import getDaysFromDate from "@/src/daysFromDate";
import React from "react";
import { useState } from "react";
import Switch, { SwitchState } from "@/app/Swtich";
import Script from "./Script";

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
	const [switchState, setSwitchState] = useState<SwitchState>(false);
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
						scrollToNormalizedPosition(v.currentTime/v.duration)
					}else{
						v.play()
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
		<audio id={idFromIndex(index)} controls muted={action.index==index && action.muted} autoPlay={action.index==index}>
			<source src={v.path} type="audio/mpeg"/>
			This browser do not support audio element
		</audio>
	</div>)
	const script=props.audiolist.filter((_,index)=>index==action.index).map((v,index)=>{
		return <Script key={v.path} json={JSON.parse(v.config)}/>
	})
	return <>
		<div style={{position: "sticky", top:0, left: 0}}>
			<Switch value={switchState} setValue={setSwitchState}>show script</Switch>
			<button onClick={()=>nextState(setInternalState, -1)}>{"<<"}</button>
			<button onClick={()=>nextState(setInternalState, +1)}>{">>"}</button>
			offset={offset()} state({internalState})={JSON.stringify(action)}
		</div>
		<div hidden={switchState==true}>
			{audiolist}
		</div>
		<div hidden={switchState==false}>
			{script}
		</div>
	</>
}
function scrollToNormalizedPosition(ratio: number) {
  // 範囲を0〜1にクリップ
  const clamped = Math.max(0, Math.min(1, ratio));
  // ドキュメント全体のスクロール可能な高さ
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollableHeight <= 0) return;
  const targetY = clamped * scrollableHeight;
  window.scrollTo({ top: targetY, behavior: 'smooth' });
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