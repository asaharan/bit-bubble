/**
 * Created by amitkum on 20/7/15.
 */
function Stylesheet(){
    this.setup();
}
Stylesheet.prototype.setup= function () {
    this.size=size;
    this.width=width - 2;
    this.minSpace=minSpace;
    var s=document.querySelector('#flexStyleSheet');
    if(s!=null){
        s.parentNode.removeChild(s);
    }
    this.generateTileWidth();
    this.generateSpaceBetweenTiles();
    this.createStyleSheet();
};
Stylesheet.prototype.generateTileWidth= function () {
    this.tileWidth=parseInt((this.width-this.minSpace)/this.size) - this.minSpace;
};
Stylesheet.prototype.generateSpaceBetweenTiles= function () {
    this.spaceBetweenTiles=parseInt((this.width - this.size * this.tileWidth) / (this.size + 1));
    var spaceOccupiedByTiles=this.tileWidth*this.size+this.spaceBetweenTiles*(this.size-1);
    this.mainGridWidth=spaceOccupiedByTiles;
    this.leftPadding=parseInt((this.width - spaceOccupiedByTiles)/2);
    this.rightPadding=this.width - this.leftPadding - spaceOccupiedByTiles;
};
Stylesheet.prototype.createStyleSheet= function () {
    var styleSheet=document.createElement('style');
    styleSheet.setAttribute('id','flexStyleSheet');
    styleSheet.setAttribute('type','text/css');
    var code='.gridContainerOuter{width:'+width+'px;height:'+width+'px}';
    //gridContainerOuter set
    code+='.gridContainerInner{width:'+this.width+'px;height:'+this.width+'px}';
    //gridContainerInner height and width set
    code+='.backgroundGrid,.mainGrid{left:'+this.leftPadding+'px;top:'+this.leftPadding+'px;width:'+this.mainGridWidth+'px;height:'+this.mainGridWidth+'px}';
    //mainGrid and backgroundGrid height,width ,left,top set
    code+='.tile,.bit{width:'+this.tileWidth+'px;height:'+this.tileWidth+'px;line-height:'+this.tileWidth+'px}';

    code+=this.makeTileClassPositionStyle();

    styleSheet.textContent='\n'+code+'\n';
    document.querySelector('head').appendChild(styleSheet);
};
Stylesheet.prototype.makeTileClassPositionStyle= function () {
    var i,j;
    var code='';
    for(i=0;i<this.size;i++){
        for(j=0;j<this.size;j++){
            code+=this.tilePositionClass(i,j)+','+this.bitPositionClass(i,j)+'{left:'+(this.tileWidth+this.spaceBetweenTiles)*i+'px;top:'+(this.tileWidth+this.spaceBetweenTiles)*j+'px}';
        }
    }
    return code;
};
Stylesheet.prototype.bitPositionClass= function (i,j) {
    return '.bit-'+i+'-'+j;
};
Stylesheet.prototype.tilePositionClass= function (i, j) {
    return '.tile-'+i+'-'+j;
};