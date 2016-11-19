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

};