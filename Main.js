const fetch = require('node-fetch');
const fs = require('fs');

const spotifyUrl = 'https://api.spotify.com/v1/me/player/currently-playing?market=FR'
const OAuth_Token = 'BQDpn4Kq8NvPqe-4-LFtvcTPBjamV6s8iOm_4TfVrlY5HTjFcGiIIXGebxupU_1fWlpxX5GeXPXiPvqC9pEBEeyORr4V48Ftlu8u63QeY3nXUO5FYc7x8DLPKh1UUUUC7pJhQpd7tKe2IRgLmmQhi0V94YV4dNORFDpFTceqyJcnnv2tIQvJK2Ws-anGGtPZPpBvwNDZYo0Bfz5SV0hbTOEByHHXNvENkJbrdzluwJ_vSokEOzBybSdvqg6_z0dlcpd7-JbBcb2DxlSuHaEJKOgB77byvufWLeYhVGEf'

var indexOfForLoop
var n
var currentTimeInSong


//lit un fichier (qui stocke la val de la pos dans la chanson) si le fichier existe pas alors on met l'index a 0
try {
  indexOfForLoop = fs.readFileSync('IndexFor.txt', 'utf8')
  //console.log('try catch',indexOfForLoop)
} catch (err) {
  indexOfForLoop = '0'
  //console.error(err)
}
let index=parseInt(indexOfForLoop) //pos dans la chanson
//console.log('index = ',index)


//return timestamp in the song + song name + artist/group name
var getSpotifyInfos=async()=>{
  try {
    var sp = await fetch(spotifyUrl, {
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer '+OAuth_Token,
        'Content-Type': 'application/json'
      }
    })
    sp = await sp.json()
  } catch (error) {
    //console.log('aucune musique est joué acutellement')
    return 'https://api.textyl.co/api/lyrics?q=%20'
  }
  
  
  console.log('We are '+(sp.progress_ms/1000).toFixed()+'s into '+sp.item.name+' from '+sp.item.album.artists[0].name)

  var songNameFormated = (sp.item.name).replace(/ /g,'%20')
  var artistNameFormated = (sp.item.album.artists[0].name).replace(/ /g,'%20')
  currentTimeInSong = ((sp.progress_ms/1000).toFixed())
  const url = ('https://api.textyl.co/api/lyrics?q='+artistNameFormated+'%20'+songNameFormated)

  //console.log(songNameFormated+'   '+artistNameFormated);
  console.log('Final url = '+url)
  return url
}

const asynchronousFunction=async(newSpotifiyUrl)=>{
  
  //check if the current song lyrics exist 
  try {
    n=(await(await fetch(newSpotifiyUrl)).json())
  } catch (error) {
    console.log('the song doesn t exist in the data base')
    //writeToFile('IndexFor','0')
    //index = 0;
    return 'J ai oublié les paroles mon reuf, déso'
  }

  //console.log('old index = '+index);

  for (let checkSeconds = 0; checkSeconds < n.length; checkSeconds++) {
    //console.log('         index of loop: '+checkSeconds+'     time in json: '+n[checkSeconds].seconds+' == '+currentTimeInSong)
    if((n[checkSeconds].seconds) <= (currentTimeInSong)){
      //console.log('true')
      index = checkSeconds
    }
  }
  //console.log('Write to file new index: '+index)
  writeToFile('IndexFor',index.toString())


  console.log(index+'/'+n.length+':  '+n[index].lyrics)
  return n[index].lyrics;
}


(async()=>{
  for (let c = 0; index < 100; index++) {
    writeToFile('IndexFor',(index+1).toString())
    return new String(await asynchronousFunction(await getSpotifyInfos()))
  }
})()

//write to a file
function writeToFile(filename,data){
  //console.log('write file',data)
  fs.writeFile(filename+'.txt', data, (err) => {
      // In case of a error throw err. 
      if (err) throw err; 
  })
}


//homemade sleep method
/*const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}*/







//WORKIING 100% :


//GET LATITUDE OF ISS WORKS!!!
//'eval const fetch=require('node-fetch'),asynchronousFunction=async()=>{const n=await fetch('https://api.wheretheiss.at/v1/satellites/25544');return(await n.json()).latitude},mainFunction=async()=>{return await asynchronousFunction()};(async()=>{return new String(await mainFunction())})();'


//AFFICHE MUSIQUE MES COUILLES FONCTIONNEN !!!!
//'eval const fetch=require('node-fetch'),fs=require('fs'),url='https://api.textyl.co/api/lyrics?q=Freeze%20Corleone%20Desiigner',sleep=e=>new Promise(n=>setTimeout(n,e));var data,n;try{data=fs.readFileSync('IndexFor.txt','utf8'),console.log(data)}catch(e){data='0',console.error(e)}let index=parseInt(data);console.log('index = ',index);const asynchronousFunction=async()=>(n=await(await fetch(url)).json(),0==index?await sleep(1e3*n[0].seconds):index<n.length&&await sleep(1e3*(n[index+1].seconds-n[index].seconds)),console.log(n[index].lyrics),n[index].lyrics);function writeToFile(e){console.log(e),fs.writeFile('IndexFor.txt',e,e=>{if(e)throw e})}(async()=>{for(;index<20;index++)return writeToFile((index+1).toString()),new String(await asynchronousFunction())})();'


//AFFICHE LES PAROLES ET TOURNE EN BOUCLE
//'eval const fetch=require('node-fetch'),fs=require('fs'),url='https://api.textyl.co/api/lyrics?q=Freeze%20Corleone%20Desiigner',sleep=e=>new Promise(n=>setTimeout(n,e));var data,n;try{data=fs.readFileSync('IndexFor.txt','utf8'),console.log('try catch',data)}catch(e){data='0',console.error(e)}let index=parseInt(data);console.log('index = ',index);const asynchronousFunction=async()=>(n=await(await fetch(url)).json(),0==index?await sleep(1e3*n[0].seconds):index<n.length-1?await sleep(1e3*(n[index+1].seconds-n[index].seconds)):index==n.length-1&&writeToFile('0'),console.log(index+'/'+n.length+':  '+n[index].lyrics),n[index].lyrics);function writeToFile(e){console.log('write file',e),fs.writeFile('IndexFor.txt',e,e=>{if(e)throw e})}(async()=>{for(;index<100;index++)return writeToFile((index+1).toString()),new String(await asynchronousFunction())})();'
        

//AVANT AJOUT SPOTIFY
//'eval const fetch=require('node-fetch'),fs=require('fs'),url='https://api.textyl.co/api/lyrics?q=Freeze%20Corleone%20Desiigner',sleep=e=>new Promise(n=>setTimeout(n,e));var data,n;try{data=fs.readFileSync('IndexFor.txt','utf8'),console.log('try catch',data)}catch(e){data='0',console.error(e)}let index=parseInt(data);console.log('index = ',index);const asynchronousFunction=async()=>(n=await(await fetch(url)).json(),0==index?await sleep(1e3*n[0].seconds):index<n.length-1?await sleep(1e3*(n[index+1].seconds-n[index].seconds)):index>=n.length-1&&writeToFile('0'),console.log(index+'/'+n.length+':  '+n[index].lyrics),n[index].lyrics);function writeToFile(e){console.log('write file',e),fs.writeFile('IndexFor.txt',e,e=>{if(e)throw e})}(async()=>{for(;index<100;index++)return writeToFile((index+1).toString()),new String(await asynchronousFunction())})();'
      


/*
const fetch = require('node-fetch');
const fs = require('fs');

const spotifyUrl = 'https://api.spotify.com/v1/me/player/currently-playing?market=ES'
const OAuth_Token = 'BQAPNCEYwUubL7bGJdB03RcVLoi5YamIZDTczw5gK0i3L5LbybZFoCvWlWjNmUzYxjvYMm-zDEMPhsw3ithwv1oIrmPkSHTOid7A5scyevPo2Nq9PLjKCWE88PkWyaYeg7bW4Qv7ZRE6HlbdHr6Mahnoo-4Dc6AAzLLwX-_zwQ'


var indexOfForLoop
var n


//lit un fichier (qui stocke la val de la pos dans la chanson) si le fichier existe pas alors on met l'index a 0
try {
  indexOfForLoop = fs.readFileSync('IndexFor.txt', 'utf8')
  //console.log('try catch',indexOfForLoop)
} catch (err) {
  indexOfForLoop = '0'
  console.error(err)
}

let index=parseInt(indexOfForLoop) //pos dans la chanson

//console.log('index = ',index)


//return timestamp in the song + song name + artist/group name
const getSpotifyInfos=async()=>{
  var n = await fetch(spotifyUrl, {
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer '+OAuth_Token,
        'Content-Type': 'application/json'
      }
    })
  n = await n.json()
  //console.log('We are '+(n.progress_ms/1000).toFixed()+'s into ''+n.item.name+'' from ''+n.item.album.artists[0].name+''')

  var songNameFormated = (n.item.name).replace(/ /g,'%20')
  var artistNameFormated = (n.item.album.artists[0].name).replace(/ /g,'%20')

  const url = ('https://api.textyl.co/api/lyrics?q='+artistNameFormated+'%20'+songNameFormated);

  //console.log(songNameFormated+'   '+artistNameFormated);
  //console.log('Final url = '+url)
  return await url
}

const asynchronousFunction=async(newSpotifiyUrl)=>{
  try {
    n=(await(await fetch(newSpotifiyUrl)).json());
  } catch (error) {
    //console.log('the song doesn't exist in the data base')
    writeToFile('IndexFor','0')
    return ('J'ai oublié les paroles mon reuf, déso');
  }
  
  if (index==0) {
    await sleep((n[0].seconds)*1000)
  } else if (index < n.length-1){
    await sleep(((n[index+1].seconds)-(n[index].seconds))*1000);
  } else if (index >= n.length-1){
    writeToFile('IndexFor','0')
  }
  //console.log(index+'/'+n.length+':  '+n[index].lyrics)
  return n[index].lyrics
}

(async()=>{
  for (let c = 0; index < 100; index++) {
    writeToFile('IndexFor',(index+1).toString())
    return new String(await asynchronousFunction(await getSpotifyInfos())) 
  }
})()

function writeToFile(filename,data){
  let text = 'Learning how to write in a file.'
  //console.log('write file',data)
  fs.writeFile(filename+'.txt', data, (err) => {
      // In case of a error throw err. 
      if (err) throw err; 
  })
}

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}
*/