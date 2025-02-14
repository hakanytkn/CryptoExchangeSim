//States = { Page: 0, 
//          active: 1
//          usersList:   [
//                        { name: "Hakan", wallet: [{coin: "Bitcoin", amount: 0.7}, {coin: "Ada", amount: 12.6}, {coin: "Etherium", amount: 35.0}] , cash: 364.82, day: 37 ,selectedCoin: BTC} , 
//                        { name: "Arda",  wallet: [{coin: "Bitcoin", amount: 5.3}, {coin: "Ada", amount: 10.8}, {coin: "Etherium", amount: 2.4 }] , cash: 14.67 , day: 122,selectedCoin: ADA} , 
//                       ]
//         }

let timer = null
let states = {}
var coinArr = ["ada", "avax", "btc", "doge", "eth", "pol", "snx", "trx", "xrp"];                           
var coinNames = ["Cordana", "Avalanche", "Bitcoin", "DogeCoin", "Ethereum", "Polygon", "Synthetix", "Tron", "Ripple"];



let storedData = localStorage.getItem("states")
//states = storedData ? JSON.parse( storedData ) : { page: 0, active: null, usersList: []}
states = storedData ? JSON.parse( storedData ) : { page: 0, active: null, usersList: []}
renderPage();



function update(){
    localStorage.setItem("states", JSON.stringify(states))
    renderPage();
}


function renderPage() {
    if(states.page === 0)
      renderIntroPage();
    else
      renderMainPage();
}

function renderIntroPage() {
    let out = `<div id="header"><div><span>CTIS</span> Crypto Trading Information System </div></div>
                <div id="overlay"></div> <div id="container">`
    if( states.usersList.length === 0){
        out += "<span>Empty</span>"
        
    }
    else{
        for(let i=0;i<states.usersList.length;i++)
            out += `<div class="user">  <i class="fa-solid fa-user fa-2xl"></i> 
                    <i class="fa-solid fa-circle-xmark" style="color: #74C0FC;"></i>
                    <p>${states.usersList[i].name}</p>
                    <div class="overlay2"></div>
                    </div>`
    }

    out += ` </div>
            <div class= "footer">
                <div class= "btnNewProfile">
                    <span>+</span> New Profile
                </div>
            </div>`
    
    

    out+=`
        <div class="addWindow">
            <p>New Profile</p>
            <input type="text" id="userName">
            <div class="addButton"> Add </div>
        </div>
        
        `
        $("#root").html(out)
        $("#root").css("display", "flex")
}

function renderMainPage(){
    //Header>>>>
    let out = `<div id="header"><div><span>CTIS</span> Crypto Trading Information System </div>
                    <div> 
                        <div>
                            <i class="fa-solid fa-user fa-lg"></i></i>${states.usersList[states.active].name}
                        </div>
                        <div>
                            <i class="fa-solid fa-door-open fa-lg"></i> Logout
                        </div>


                    </div>
    
    
                </div>`
               
                $("#root").css("display", "block")            
    
    out += renderDayInfo();

    out += renderTable();

     out += renderBalance();

     out += `<div id="mainBot">
                 <div id="left">
                     ${renderTrading()}
                 </div>
                 <div id="right">
                     ${renderWallet()}
                 </div>
             </div>`


    $("#root").html(out);

    if(states.usersList[states.active].day===365){
        $("#left").remove();
        $("#balance").addClass("animated");
        $("#walletContainer").css("width" , "100%");
        $("#right").css("flex" , 1);
    }
}

function renderDayInfo(){
    let dateArr = market[states.usersList[states.active].day - 1].date.split("-");
    console.log()
    let out=`<p id="dayP"> Day ${states.usersList[states.active].day}</p>
             <p id="dateP"> ${dateArr[0]} ${months[parseInt(dateArr[1]) - 1]} ${dateArr[2]}  </p>
             `

    out += `<div id="BtnContainer">
                <div>
                    <i class="fa-solid fa-forward fa-lg"></i>Next Day
                    <div class="overlay2"></div>
                </div>
                <div>`
    if(timer===null)
        out += `<i class="fa-solid fa-play fa-lg"></i>Play
        <div class="overlay2"></div>`
    else
        out += `<i class="fa-solid fa-pause fa-lg"></i>Pause
        <div class="overlay2"></div>`

               out+= `</div>
            </div>
            `
    return out;
}

//Changes===========================
//====================================
function renderTable(){

    let out = `<div id="tableContainer">
                   <div>`
    
    for(let n=0;n<coinArr.length;n++)
    {
        out += `<img src="./images/${coinArr[n]}.png" 
        class="${coinArr[n]===states.usersList[states.active].selectedCoin ? 'animated' : '' }">`
    }
    out += `</div>
                
            <div>
                <div>
                    <img src="./images/${states.usersList[states.active].selectedCoin}.png"> 
                    ${coinNames[coinArr.indexOf(states.usersList[states.active].selectedCoin)]}
                </div>
                <div class="desc">
                    
                </div>
            </div>
            <div id="chart">
                `
    let lastDay = states.usersList[states.active].day;
    let firstDay = lastDay - 119;
    let coinIndex = coinArr.indexOf(states.usersList[states.active].selectedCoin);
    if(firstDay < 0)
        firstDay = 2;

    let upper = findUpperLimit(firstDay, lastDay, coinIndex)
    let lower = findLowerLimit(firstDay, lastDay, coinIndex)
    console.log(firstDay, lastDay, upper, lower);
    let bigger
    let smaller
    let height, bottom, top
    console.log(firstDay, lastDay)
    for(let i=firstDay-2 ; i<=lastDay-2 ; i++){
        bottom = (market[i].coins[coinIndex].low - lower) / (upper - lower) * 400;
        top = (market[i].coins[coinIndex].high - lower) / (upper - lower) * 400;
        out += `<div class="stick" style="position: absolute; border: 1px solid black; bottom: ${bottom}px; height: ${ top - bottom }px; width: 0px; 
                    left:${7.5 + (i-firstDay+2)*9}px">
                </div>`

        if(market[i].coins[coinIndex].open > market[i].coins[coinIndex].close){
            bigger = (market[i].coins[coinIndex].open - lower) / ( upper - lower ) * 400;
            smaller = (market[i].coins[coinIndex].close - lower) / ( upper - lower ) * 400;
            height = bigger - smaller
            out += `<div class="candle" style="position: absolute; background-color: red; left: ${5+ (i-firstDay+2)*9}px; height: ${height}px; bottom: ${smaller}px; width: 5px">
                    </div>`
        }
        else{
            smaller = (market[i].coins[coinIndex].open - lower) / ( upper - lower ) * 400;
            bigger = (market[i].coins[coinIndex].close - lower) / ( upper - lower ) * 400;
            height = bigger - smaller
            out += `<div class="candle" style="position: absolute; background-color: green; left: ${5+ (i-firstDay+2)*9}px; height: ${height}px; bottom: ${smaller}px; width: 5px">
                    </div>`
        }
    }




    out +=         `
            <div id="upper">$ ${upper.toPrecision(7)}</div>
            <div id="Lower">$ ${lower.toPrecision(7)}</div>
            <div id="price" style="bottom: ${(market[lastDay-2].coins[coinIndex].close - lower) / ( upper - lower ) * 400}px">
            $ ${(market[lastDay-2].coins[coinIndex].close).toPrecision(7) }
            </div>
            </div>
            </div>
    `

    return out;
}

function updateChart(){
    out = ""

    let lastDay = states.usersList[states.active].day;
    let firstDay = lastDay - 119;
    let coinIndex = coinArr.indexOf(states.usersList[states.active].selectedCoin);
    if(firstDay < 0)
        firstDay = 2;

    let upper = findUpperLimit(firstDay, lastDay, coinIndex)
    let lower = findLowerLimit(firstDay, lastDay, coinIndex)
    console.log(firstDay, lastDay, upper, lower);
    let bigger
    let smaller
    let height, bottom, top
    
    for(let i=firstDay-2 ; i<=lastDay-2 ; i++){

        bottom = (market[i].coins[coinIndex].low - lower) / (upper - lower) * 400;
        top = (market[i].coins[coinIndex].high - lower) / (upper - lower) * 400;
        out += `<div class="stick" style="position: absolute; border: 1px solid black; bottom: ${bottom}px; height: ${ top - bottom }px; width: 0px; 
                    left:${7.5 + (i-firstDay+2)*9}px">
                </div>`


        if(market[i].coins[coinIndex].open > market[i].coins[coinIndex].close){
            bigger = (market[i].coins[coinIndex].open - lower) / ( upper -lower ) * 400;
            smaller = (market[i].coins[coinIndex].close - lower) / ( upper - lower ) * 400;
            height = bigger - smaller
            out += `<div class="candle" style="position: absolute; background-color: red; left: ${5+ (i-firstDay+2)*9}px; height: ${height}px; bottom: ${smaller}px; width: 5px">
                    </div>`
        }
        else{
            smaller = (market[i].coins[coinIndex].open - lower) / ( upper -lower ) * 400;
            bigger = (market[i].coins[coinIndex].close - lower) / ( upper  - lower) * 400;
            height = bigger - smaller
            out += `<div class="candle" style="position: absolute; background-color: green; left: ${5+ (i-firstDay+2)*9}px; height: ${height}px; bottom: ${smaller}px; width: 5px">
                    </div>`
        } 
    }

    out+= `<div id="upper">$ ${upper.toPrecision(7)}</div>
            <div id="Lower">$ ${lower.toPrecision(7)}</div>
            <div id="price" style="bottom: ${(market[lastDay-2].coins[coinIndex].close - lower) / ( upper - lower ) * 400}px">
            $ ${(market[lastDay-2].coins[coinIndex].close).toPrecision(7) }
            </div>`
       
    
    $("#chart").html(out)
    clearFeilds();
    $("#resultLbl").text("")
}

function findUpperLimit(day0, day1, coinIndex){
    let max = market[0].coins[coinIndex].high 
    for(let i=1;i<day1;i++){
        if(market[i].coins[coinIndex].high > max)
            max = market[i].coins[coinIndex].high
    }
    return(max*1.1);
    
    
    // let upper = market[day0].coins[coinIndex].close * 1.1;
    // for(let i=1;i<=day1-day0;i++) 
    // {
    //     if(market[day0+i].coins[coinIndex].close > 0.96 * upper)
    //         if(market[day0+i].coins[coinIndex].high * 1.04 > upper)
    //             upper = market[day0+i].coins[coinIndex].close * 1.04;

    //     // if(market[day0+i].coins[coinIndex].high - market[day0].coins[coinIndex].close > (upper - market[day0].coins[coinIndex].close) * 0.8 )
    //     //     upper = market[day0+i].coins[coinIndex].high * 1.04;
    // }
    //return upper;
}

function findLowerLimit(day0, day1, coinIndex){
    let min = market[0].coins[coinIndex].low 
    for(let i=1;i<day1;i++){
        if(market[i].coins[coinIndex].low < min)
            min = market[i].coins[coinIndex].low
    }
    return(min*0.9);
    
    // let lower = market[day0].coins[coinIndex].close * 0.9;
    // for(let i=1;i<=day1-day0;i++)
    // {
    //     // if(lower >  market[day0+i].coins[coinIndex].low * 0.8)
    //     //     lower = market[day0+i].coins[coinIndex].low *0.94
    //     if(market[day0].coins[coinIndex].close - market[day0+i].coins[coinIndex].low > (market[day0].coins[coinIndex].close - lower) * 0.98)
    //          lower = market[day0+i].coins[coinIndex].low * 0.95;
    // }
    // return lower;
}

//Hakan ===========================================================================
function renderBalance(){

    let balance = states.usersList[states.active].cash

    for(let i of states.usersList[states.active].wallet){
         
       balance += i.amount * market[states.usersList[states.active].day-2].coins[coinArr.indexOf(i.coin)].close
    
    }
    
    let out = `<div id="balance"> <span id="walletCash">$ ${balance.toFixed(2)}</span></div>`
    return out
}

function updateBalance(){

    let balance = states.usersList[states.active].cash

    for(let i of states.usersList[states.active].wallet){
         
       balance += i.amount * market[states.usersList[states.active].day-2].coins[coinArr.indexOf(i.coin)].close
    
    }
    
    $("#balance>span").text(`$ ${balance.toFixed(2)}`);
}
    
    
    
function renderWallet(){
    let out = 
    
                    `<div id="walletContainer">
                    <h3 id="walletHeading">Wallet</h3>
                    <table id="walletTable">
                        
                            <tr id="first">
                                <td>Coin</td>
                                <td>Amount</td>
                                <td>Subtotal</td>
                                <td>Last Close</td>
                            </tr>
                            <tr id="second">
                            <td>Dollar</td>
                            <td>${states.usersList[states.active].cash.toFixed(2)} $</td>
                            <td></td>
                            <td></td>
                            </tr>
                            `
                            for(let i of states.usersList[states.active].wallet)
                                
                    out+=  `
                            <tr class="coinRow">
                            <td> <img src="images/${i.coin}.png">${coinNames[coinArr.indexOf(i.coin)]}</td>
                            <td>${i.amount}</td>
                            <td>${(i.amount * market[states.usersList[states.active].day-2].coins[coinArr.indexOf(i.coin)].close).toFixed(2)}</td>
                            <td>${(market[states.usersList[states.active].day-2].coins[coinArr.indexOf(i.coin)].close).toFixed(2)}</td>
                            </tr>
                            `

                    out+= `</table>
                        </div>
                        `
                        return out
}


function updateWallet(){
    let out = 
    
                    `<div id="walletContainer">
                    <h3 id="walletHeading">Wallet</h3>
                    <table id="walletTable">
                        
                            <tr id="first">
                                <td>Coin</td>
                                <td>Amount</td>
                                <td>Subtotal</td>
                                <td>Last Close</td>
                            </tr>
                            <tr id="second">
                            <td>Dollar</td>
                            <td>${states.usersList[states.active].cash.toFixed(2)} $</td>
                            <td></td>
                            <td></td>
                            </tr>
                            `
                            for(let i of states.usersList[states.active].wallet)
                                
                    out+=  `
                            <tr class="coinRow">
                            <td> <img src="images/${i.coin}.png">${coinNames[coinArr.indexOf(i.coin)]}</td>
                            <td>${i.amount}</td>
                            <td>${(i.amount * market[states.usersList[states.active].day-2].coins[coinArr.indexOf(i.coin)].close).toFixed(2)}</td>
                            <td>${(market[states.usersList[states.active].day-2].coins[coinArr.indexOf(i.coin)].close).toFixed(2)}</td>
                            </tr>
                            `


                        
                    
                    out+= `</table>
                        </div>
                        `
                        
    $("div#right").html(out)
}




//End Hakan ==================================================================
//Elci =====================================

function renderTrading() {
    let selectedCoinName = "";
    selectedCode = states.usersList[states.active].selectedCoin;
    for (let i = 0; i < coins.length; i++) {
        if (coins[i].code === selectedCode) {
            selectedCoinName = coins[i].name;
            break;
        }
    }

    let out = `<div class="trading-section">
      <h2>Trading</h2>
      <div class="toggle-buttons">
        <button class="active" id="buyButton" >Buy</button>
        <button id="sellButton">Sell</button>
      </div>
      <div class="input-group">
        <input type="text" placeholder="Amount">
        <span>$</span>
      </div>
      <button class="action-button" id="actionButton" style="background-color: #4CAF50">Buy ${selectedCoinName}</button>
    
        <div id="resultLbl">
            
        </div>
    
      </div>`;

    return out;
}


//END Elci


//Event Handlers ----------------------------------------------------------------------

$("#root").on("click", ".btnNewProfile", function(e){
    // alert("clicked")
    $("#overlay").css("display", "inline")
    $("#root .addWindow").css("display", "inline").css("opacity", 1)
})

$("#root").on("click", "#overlay", function() {
    $(".addWindow").css("display", "none");
    $(this).css("display", "none");
});

$("#root").on("click",".addButton", function(){
    let userObj = {};
    if($("#userName").val() !== ""){
        userObj = {name: $("#userName").val(), wallet: [], cash: 1000.0, day: 2, selectedCoin: "btc"};
        states.usersList.push(userObj);
        update();}
})


$("#root").on("click", "i:nth-of-type(2)", function(e){
    e.stopPropagation()
    let idx = $(this).parent().index()
    states.usersList.splice(idx, 1)
    update();
})

$("#root").on("click", ".user", function(e){
    e.stopPropagation()
    let idx = $(this).index()
    states.active = idx;
    states.page = 1;
    update();
})



//Event Handlers for the Main page
$("#root").on("click", "#header>div:nth-of-type(2)>div:nth-of-type(2)", function(){
    states.page = 0;
    states.active = null;
    update();
})

// NextDay button
$("#root").on("click", "#BtnContainer>div:first-of-type", function(e){
    e.stopPropagation()
    states.usersList[states.active].day++;
    update()
    
})

function increamentDay(){
    states.usersList[states.active].day++;
    
    let dateArr = market[states.usersList[states.active].day - 1].date.split("-");
    $("#dayP").text("Day " + states.usersList[states.active].day);
    $("#dateP").text(`${dateArr[0]} ${months[parseInt(dateArr[1]) - 1]} ${dateArr[2]}`)
    localStorage.setItem("states", JSON.stringify(states))
    updateChart();
    
    
    let lastDay = states.usersList[states.active].day;
    let firstDay = lastDay - 119;
    let coinIndex = coinArr.indexOf(states.usersList[states.active].selectedCoin);
    if(firstDay < 0)
        firstDay = 0;

    let upper = findUpperLimit(firstDay, lastDay, coinIndex)
    let lower = findLowerLimit(firstDay, lastDay, coinIndex)
    console.log(firstDay, lastDay, upper, lower);

    updateBalance();
    updateWallet();
    if(states.usersList[states.active].day===365){
        clearInterval(timer);
        update();
    }

}

$("#root").on("click", "#BtnContainer>div:nth-of-type(2)", function(e){
    e.stopPropagation()
    if(timer===null){
        timer = setInterval(increamentDay, 100);
        $("#BtnContainer>div:nth-of-type(2)").html(`<i class="fa-solid fa-pause fa-lg"></i>Pause
            <div class="overlay2"></div>`)
            
    }
    else{
        clearInterval(timer);
        timer=null;
        $("#BtnContainer>div:nth-of-type(2)").html(`<i class="fa-solid fa-play fa-lg"></i>Play
                    <div class="overlay2"></div>`)
        
    }
    //update()
})

$("#root").on("click", "#tableContainer>div>img", function(e){
    e.stopPropagation
    states.usersList[states.active].selectedCoin = coinArr[$(this).index()]
    update();
})

//Elci=================================
$("#root").on("click", ".toggle-buttons button", function () {
    const isBuy = $(this).attr("id") === "buyButton";
    $("#buyButton").toggleClass("active", isBuy);
    $("#sellButton").toggleClass("active", !isBuy);
    let coinName = coinNames[coinArr.indexOf(states.usersList[states.active].selectedCoin)]

    // Update action button text and color
    const actionButton = $("#actionButton");
    if (isBuy) {
        actionButton.text(`Buy ${coinName || ""}`);
        actionButton.css("background-color", "#4CAF50");
    } else {
        actionButton.text(`Sell ${coinName || ""}`);
        actionButton.css("background-color", "#f44336");
    }
});

$("#root").on("keyup", ".input-group input", function(e){
    if(e.type==="keyup"){
        let price = ($(this).val() * market[states.usersList[states.active].day-2].coins[coinArr.indexOf(states.usersList[states.active].selectedCoin)].close).toFixed(2)
        let out = price;
        $(".input-group span").text(` = $ ${out}`);
    }
})

$("#root").on("click", ".action-button", function(){

})
//END Elci=============================

$("#root").on("mouseenter", ".candle", function(){
   let day = ($(this).index()+1)/2
   let index = ($(this).index()+1)/2
   if(states.usersList[states.active].day>120)
        day += states.usersList[states.active].day - 121
    let obj = market[day-1].coins[coinArr.indexOf(states.usersList[states.active].selectedCoin)];
   $(".desc").text(`Date: ${market[day-1].date} Open: ${obj.open} Close: ${obj.close} High: ${obj.high} Low: ${obj.low}`)

}).on("mouseleave", ".candle", function(){
    $(".desc").text("")
})



$("#root").on("click", ".action-button", function(){
    if($("#buyButton").attr("class")==="active")
    {
        if($(".input-group input").val() * market[states.usersList[states.active].day-2].coins[coinArr.indexOf(states.usersList[states.active].selectedCoin)].close>states.usersList[states.active].cash)
            $("#resultLbl").text("Not enough cash!")
        else{
            $("#resultLbl").text("")
            states.usersList[states.active].cash -= $(".input-group input").val() * market[states.usersList[states.active].day-2].coins[coinArr.indexOf(states.usersList[states.active].selectedCoin)].close
            let added=false
            let purch = {}
            purch.coin = states.usersList[states.active].selectedCoin;
            for (let element of states.usersList[states.active].wallet) {
                if(element.coin===purch.coin){
                    element.amount +=  parseFloat($(".input-group input").val())
                    added = true
                }
            }
            if(!added){
                purch.amount = parseFloat($(".input-group input").val())
                states.usersList[states.active].wallet.push(purch)
            }
            $("#resultLbl").text("")
        }
        
    }
    else{
        let deduced=false
        for (let element of states.usersList[states.active].wallet) {
            if(element.coin===states.usersList[states.active].selectedCoin && element.amount >= parseFloat($(".input-group input").val())){
                element.amount -=  parseFloat($(".input-group input").val())
                deduced = true
                states.usersList[states.active].cash += $(".input-group input").val() * market[states.usersList[states.active].day-2].coins[coinArr.indexOf(states.usersList[states.active].selectedCoin)].close
                $("#resultLbl").text("")
                if(element.amount===0)
                    states.usersList[states.active].wallet.splice(states.usersList[states.active].wallet.indexOf(element), 1)
            }
        }
        
        if(!deduced){
            $("#resultLbl").text(`Not enough amount for ${coinNames[coinArr.indexOf(states.usersList[states.active].selectedCoin)]}`)
        }
    }


    updateWallet();
    localStorage.setItem("states", JSON.stringify(states));
    clearFeilds()
    
})


function clearFeilds(){
    $(".input-group input").val("")
    $(".input-group span").text(" = $")
    
}