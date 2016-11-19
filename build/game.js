/*!
 * Bit Bubble
 * http://github.com/asaharan/bit-bubble
 * @licence MIT
*/
/*!
 * js/animation_polyfill.js
*/
/**
 * Created by amitkum on 20/7/15.
 */
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
            || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());;
/*!
 * js/application.js
*/
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
};
/*!
 * js/bit_manager.js
*/
/**
 * Created by amitkum on 20/7/15.
 */

/*
*@param {string} side should be left,down,up or right
 */
function Bit(side){
    this.side=side;
    this.value=0;
    this.classList=['bit',this.side,'invisible'];
    this.x=0;
    this.y=0;
    this.htmlNode=null;
}
Bit.prototype.getPositionClass= function () {
    return 'bit-'+this.x+'-'+this.y;
};
Bit.prototype.createHTMLBit= function () {
    var bit=document.createElement('div');
    bit.setAttribute('class','bit '+this.side);
    this.htmlNode=bit;
    return bit;
};
Bit.prototype.applyClasses=function(){
    this.htmlNode.setAttribute('class',this.classList.join(' '));
};


function BitManager(){
    this.bits={};
    this.events=[];
    this.mainGrid=document.querySelector('.mainGrid');
    this.setup();
    this.time = 400;
}
BitManager.prototype.setup= function () {
    this.bits[directions.up]=new Bit('up');
    this.bits[directions.right]=new Bit('right');
    this.bits[directions.down]=new Bit('down');
    this.bits[directions.left]=new Bit('left');
    for(var bit in this.bits){
        this.mainGrid.appendChild(this.bits[bit].createHTMLBit());
    }
};
/*
*@{number} bitIndex is direction of bit
 */
BitManager.prototype.moveBit=function(bitIndex,initialPosition,finalPosition,bitValue,destroy){
    var self=this;
    var bit=this.bits[bitIndex];
    bit.value=bitValue;
    bit.x=initialPosition.x;
    bit.y=initialPosition.y;
    bit.htmlNode.textContent=bitValue;
    bit.classList[4]='';
    bit.classList[3]=bit.getPositionClass();
    bit.applyClasses();
    window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function(){
            bit.x=finalPosition.x;
            bit.y=finalPosition.y;
            //console.log(bit);
            bit.classList[3]=bit.getPositionClass();
            bit.classList[2]='visible';
            bit.classList[4]='transition';
            if(destroy==true){
                //this means this bit should be thrown away
                console.log(bitIndex,initialPosition,finalPosition,bitValue);
                bit.classList[5]='destroy-'+bitIndex;
            }
            bit.applyClasses();
            setTimeout(function () {
                bit.classList.length=2;
                bit.htmlNode.textContent='';
                bit.applyClasses();
                if(destroy==true){

                }else{
                    self.emit('mergeComplete',{position:finalPosition,valueTobeAdded:bitValue});
                }
            },self.time);
        });
    });
};
BitManager.prototype.on= function (event,callback) {
    if(!this.events[event]){
        this.events[event]=[];
    }
    this.events[event].push(callback);
};
BitManager.prototype.emit= function (event,data) {
    var callbacks=this.events[event];
    if(callbacks){
        callbacks.forEach(function (callback) {
            callback(data);
        })
    }
};;
/*!
 * js/game_manager.js
*/
function GameManager(gridManager,styleSheetManager,bitManager,masterLogic){
    this.gridManager=new gridManager;
    this.styleSheetManager=new styleSheetManager;
    this.bitManager=new bitManager;
    this.masterLogic=new masterLogic;
    this.init();
    this.xbitManager=bitManager;
    this.xgridManager=gridManager;
}
GameManager.prototype.init= function () {
    console.log(document.querySelector('.tryAgain'));
    document.querySelector('.newGame').addEventListener('click',this.restart.bind(this));
    document.querySelector('.tryAgain').addEventListener('click',this.restart.bind(this));
    this.gridManager.on('tileClick',this.play.bind(this));
    this.bitManager.on('mergeComplete',this.onMerge.bind(this));
};
GameManager.prototype.restart= function () {
    document.getElementById('gameOverContainer').setAttribute('class','gameOver');
    var self=this;
    self.gridManager=null;
    self.bitManager=null;
    this.styleSheetManager.setup();
    document.querySelector('.mainGrid').innerHTML='';
    window.requestAnimationFrame(function(){
        self.gridManager=new self.xgridManager;
        self.bitManager=new self.xbitManager;
        self.gridManager.on('tileClick',self.play.bind(self));
        self.bitManager.on('mergeComplete',self.onMerge.bind(self));
    })
};
GameManager.prototype.play=function(clickedTile){
    var self=this;
    clickedTile.isVisible=false;
    var availableDirections=this.masterLogic.directions(clickedTile.position());
    if(availableDirections){
        var scoreOfBit=parseInt(clickedTile.value/availableDirections.length);
        availableDirections.forEach(function (direction) {
            var nextTile=self.gridManager.findNextTile(clickedTile.position(),direction);
            if(nextTile!=null){
                self.bitManager.moveBit(direction,clickedTile.position(),nextTile.position(),scoreOfBit);
            }else{
                console.log('next tile not found for ',direction,directions);
                self.bitManager.moveBit(direction,clickedTile.position(),clickedTile.position(),scoreOfBit,true);
            }
        });
    }
    this.gridManager.applyChanges();
};
GameManager.prototype.onMerge= function (mergeDetails) {//this will called from bit manager when bit animation is over
    //console.log('bit animation over and merge details are: ',mergeDetails,'now it should be updated now')
    var tileToBeUpdated=this.gridManager.findTileByPosition(mergeDetails.position);
    tileToBeUpdated.nextValue=tileToBeUpdated.value+mergeDetails.valueTobeAdded;
    this.gridManager.applyChanges();
    if(this.gridManager.isGameOver()){
        //Game Over
        setTimeout(function(){
            document.getElementById('gameOverContainer').setAttribute('class','gameOver open');
        },300);
    }

};;
/*!
 * js/grid_manager.js
*/
/**
 * Created by amitkum on 20/7/15.
 */
function Grid(){
    var self=this;
    this.events=[];
    this.grid=[];//grid will be array of tiles
    this.previousGrid=[];
    this.fixedTile=null;
    this.size=size;
    this.initialValue=initialValue;
    this.gridContainerOuter=document.querySelector('.gridContainerOuter');
    this.gridContainerInner=document.querySelector('.gridContainerInner');
    this.backgroundGrid=document.querySelector('.backgroundGrid');
    this.mainGrid=document.querySelector('.mainGrid');

    window.requestAnimationFrame(function () {
        self.setup();
    });
}
Grid.prototype.emptyGrid=function(){
    this.applyChanges();
}
Grid.prototype.setup= function () {
    var i,j;
    var randomPosition=this.getRandomPosition();
    for(i=0;i<this.size;i++){
        for(j=0;j<this.size;j++){
            var tile;
            if(i==randomPosition.x&&j==randomPosition.y){
                tile=this.createTile({x:i,y:j},this.initialValue,true);
            }else{
                tile=this.createTile({x:i,y:j},this.initialValue,false);
            }
            // console.log('mainGrid is '+this.mainGrid);
            tile.addEventListener('click',this.onTileClick.bind(this));
            this.mainGrid.appendChild(tile);
        }
    }
};
Grid.prototype.createTile= function (position,value,isFixed) {
    var tile=new Tile(position.x,position.y,value);
    if(isFixed==true){
        tile.classList[4]='fixed';
        tile.isFixed = true;
        this.fixedTile = tile;
    }
    tile.isVisible=true;
    this.grid.push(tile);
    return tile.makeHTMLNode();
};
Grid.prototype.getRandomPosition= function () {
    var random={};
    random.x=Math.floor(Math.random()*this.size);
    random.y=Math.floor(Math.random()*this.size);
    return random;
};
/*
* Applies changes to grid, if any
**/
Grid.prototype.applyChanges= function () {
    console.log('grid',this.grid);
    this.grid.forEach(function (tile) {
       tile.applyChanges();
    });
};
Grid.prototype.applyClasses=function(element,classes){
    element.setAttribute('class',classes.join(' '));
};
Grid.prototype.on= function (event,callback) {
    if(!this.events[event]){
        this.events[event]=[];
    }
    this.events[event].push(callback);
};
Grid.prototype.emit= function (event,data) {
    var callbacks=this.events[event];
    if(callbacks){
        callbacks.forEach(function (callback) {
            callback(data);
        })
    }
};
Grid.prototype.onTileClick= function (event) {
    if(event.target==this.fixedTile.htmlNode || this.findTileById(event.target.id).isVisible==false){//clicked on fixed tile
        console.log(event.target);
        return;
    }
    this.emit('tileClick',this.findTileById(event.target.id));
};
Grid.prototype.findTileById= function (id) {
    var tile=null;
    this.grid.forEach(function (t) {
        if(t.positionClass()==id){
            tile=t;
        }
    });
    return tile;
};
Grid.prototype.findNextTile= function (position, dir) {
    var toMerge=null;
    var i=0;
    if(directions.right==dir){
        for(i=position.x+1;i<this.size;i++){
            toMerge=this.findTileByPosition({x:i,y:position.y});
            if(toMerge!=null){
                return toMerge;
            }
        }
        return null;
    }
    if(directions.down==dir){
        for(i=position.y+1;i<this.size;i++){
            toMerge=this.findTileByPosition({x:position.x,y:i});
            if(toMerge!=null){
                return toMerge;
            }
        }
        return null;
    }
    if(directions.left==dir){
        for(i=position.x-1;i>-1;i--){
            toMerge=this.findTileByPosition({x:i,y:position.y});
            if(toMerge!=null){
                return toMerge;
            }
        }
        return null;
    }
    if(directions.up==dir){
        for(i=position.y-1;i>=-1;i--){
            toMerge=this.findTileByPosition({x:position.x,y:i});
            if(toMerge!=null){
                return toMerge;
            }
        }
        return null;
    }
    return false;
};
Grid.prototype.findTileByPosition= function (position) {
    var tileToReturn=null;
    this.grid.forEach(function (tile) {
        var tilePosition=tile.position();
        if(tilePosition.x==position.x&&tilePosition.y==position.y&&tile.isVisible==true){
            tileToReturn=tile;
        }
    });
    return tileToReturn;
};

Grid.prototype.isGameOver = function(){
    var isOver = true;
    for( a in directions){
        if(this.findNextTile(this.fixedTile.position(),directions[a])!=null){
            isOver = false;
            console.warn('isOver',directions[a], this.findNextTile(this.fixedTile.position(),directions[a]));
            break;
        }
    }
    if(isOver){
        console.log('game over');
    }else{
        console.log('game not over');
    }
    return isOver;
    console.log('findNextTile fixedTile left',this.findNextTile(this.fixedTile.position(),[directions.left] ));
    console.log('findNextTile fixedTile right',this.findNextTile(this.fixedTile.position(),[directions.right] ));
    console.log('findNextTile fixedTile down',this.findNextTile(this.fixedTile.position(),[directions.down] ));
    console.log('findNextTile fixedTile up',this.findNextTile(this.fixedTile.position(),[directions.up] ));
    // console.log(this.fixedTile);  
};
/*!
 * js/master_logic.js
*/
/**
 * Created by amitkum on 20/7/15.
 */
function MasterLogic(){
    this.size=size;
}
MasterLogic.prototype.findAllDirections= function (position) {
    console.log(this.directions(position));
};
MasterLogic.prototype.directions= function (tile) {
    var corner=this.isCorner(tile);//corner has directions in which tiles has to be fired
    if(corner){
        return corner;
    }
    var center=this.isCenter(tile);
    if(center){
        return center;
    }
    return this.isEdge(tile);
};
MasterLogic.prototype.isCorner= function (tile) {
    if(tile.x==0&&tile.y==0){
        return [directions.right,directions.down];
    }
    if(tile.x==size-1&&tile.y==0){
        return [directions.left,directions.down];
    }
    if(tile.x==0&&tile.y==size-1){
        return [directions.right,directions.up];
    }
    if(tile.x==size-1&&tile.y==size-1){
        return [directions.left,directions.up];
    }
    return false;
};
MasterLogic.prototype.isCenter=function(tile){
    if(tile.x>0&&tile.x<size-1&&tile.y>0&&tile.y<size-1){
        return [directions.up,directions.right,directions.down,directions.left];
    }
    return false;
};
MasterLogic.prototype.isEdge= function (tile) {
    if(tile.x==0&&(tile.y>0&&tile.y<size-1)){//left edge
        return [directions.up,directions.right,directions.down];
    }
    if(tile.x==size-1&&(tile.y>0&&tile.y<size-1)){//right edge
        return [directions.up,directions.down,directions.left];
    }
    if(tile.y==0&&(tile.x>0&&tile.x<size-1)){//top edge
        return [directions.right,directions.down,directions.left];
    }
    if(tile.y==size-1&&(tile.x>0&&tile.x<size-1)){//bottom edge
        return [directions.up, directions.right, directions.left];
    }
};;
/*!
 * js/stylesheet.js
*/
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
};;
/*!
 * js/tile.js
*/
/**
 * Created by amitkum on 20/7/15.
 */

/*
* create new tile, isVisible=true
* */
function Tile(x,y,value){
    this.x=x;
    this.y=y;
    this.value=value;
    this.nextValue=null;
    this.isVisible=true;
    this.isFixed = false;
    this.htmlNode=null;
    this.time = 200;
    this.classList=['tile',this.positionClass(),'visible','new'];//4th class for fixed and 5th for updated
}
Tile.prototype.position= function () {
    return {x:this.x,y:this.y};
};
/*
* If isVisible show it else hide it
* @this {Tile}
* */
Tile.prototype.applyChanges= function () {
    var self=this;
    if(this.isVisible){
        this.classList[2]='visible';
    }else{
        this.classList[2]='invisible';
    }
    if(this.nextValue!=null){
        this.htmlNode.textContent=this.nextValue;
        this.classList[5]='updated';
        this.value=this.nextValue;
        this.nextValue=null;
        setTimeout(function () {
            self.classList[5]='';
            self.applyClasses();
        },self.time)
    }
    this.applyClasses();
};
Tile.prototype.positionClass= function () {
    return 'tile-'+this.x+'-'+this.y;
};
Tile.prototype.makeHTMLNode= function () {
    var tileElement=document.createElement('div');
    this.htmlNode=tileElement;
    tileElement.textContent=this.value;
    tileElement.setAttribute('id',this.positionClass());
    this.htmlNode.setAttribute('class',this.classList.join(' '));
    return this.htmlNode;
};
Tile.prototype.applyClasses=function(){
    this.htmlNode.setAttribute('class',this.classList.join(' '));
};