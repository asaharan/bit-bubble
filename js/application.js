/**
 * Created by amitkum on 20/7/15.
 */
var size= 6,directions={up:1,right:2,down:3,left:4};
var game;
var initialValue=512,width=502,minSpace=10;
window.requestAnimationFrame(function () {
	var s=window.localStorage['GridSize'];
	if(s!=undefined||s!=null){
		size=parseInt(s);
	}else{
		console.log(s);
	}
	document.querySelector('.levelselect').value=size;
	new GameManager(Grid,Stylesheet,BitManager,MasterLogic);
});
function resizeGrid(v){
	size=parseInt(v);
	window.localStorage['GridSize']=v;
}