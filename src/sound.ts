import { zzfx, zzfxP, zzfxM} from './zzfx';

export const playDead = () => {
  zzfx(
    ...[
      1.07,
      ,
      127,
      0.02,
      0.01,
      0.01,
      2,
      2.63,
      ,
      7.6,
      677,
      0.02,
      ,
      ,
      ,
      0.4,
      ,
      0.61,
      0.22,
      0.04,
    ]
  ); // Random 75
};
export const playSong = () => {
  const song = [[[,0,400,,.02,.5,,,,.1,,.1,,,,,,,.01],[,0]],[[[,,4,,,,4,,,,2,,,,4,,,,2,,,,4,,,,2,,,,4,,,,2,,,,4,,,,2,,,,4,,,,2,,,,4,,,,,,,,,,,,],[1,1,5,7,9,7,9,7,,7,,7,,7,,7,9,7,9,7,9,7,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,],[,-1,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,],[,1,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,]]],[0],,{"title":"New Song","instruments":["Instrument 0","Instrument 1"],"patterns":["Pattern 0"]}]
  let mySongData = zzfxM(...song);
  
  
  // Play the song (returns a AudioBufferSourceNode)
  let myAudioNode = zzfxP(...mySongData);
  myAudioNode.loop = true

  // Stop the song
  // myAudioNode.stop();
}
