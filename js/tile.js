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