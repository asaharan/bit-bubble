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
};