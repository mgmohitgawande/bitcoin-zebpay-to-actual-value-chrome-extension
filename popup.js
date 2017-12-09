(function(){
  window.onload = function(){
    var saved_data = {}
    var quantity_hold = null;
    var quantity_type_multiplier = null;
    var buy_price = null;

    var showPriceNotification = function(title, message, items){
      chrome.notifications.create(new Date().getTime()+ 'notification', {
        type : 'list',
        title : title,
        message : message,
        items : items,
        iconUrl : './icon.png',
        // imageUrl : './icon.png',
        isClickable : true
      }, function(){
        // console.log('notificationsnotifications data', arguments)
      })
    }
    
    var handleNotification = function(data){
      var buyAlarm = parseFloat(document.getElementsByName('buy_alarm')[0].value);
      var sellAlarm = parseFloat(document.getElementsByName('sell_alarm')[0].value);
      // console.log('datatatata buyyy', data.buy, buyAlarm + 5000, data.buy < buyAlarm + 5000)
      // console.log('datatatata selll', data.sell, sellAlarm + 5000, data.sell > sellAlarm - 5000)
      
      if((buyAlarm && data.buy < buyAlarm + 5000) || (sellAlarm && data.sell > sellAlarm - 5000)){
        
        console.log((buyAlarm && data.buy < buyAlarm + 5000), (sellAlarm && data.sell > sellAlarm - 5000))
        var title = data.buy < buyAlarm + 5000 ? 'BUY PRICE IS CLOSE' : 'SELL PRICE IS CLOSE';
        var message = 'HERE IS MY MESSAGE FOR YOU' ;
        var items = [
            { title: "BUY: " + data.buy, message: "SELL: " + data.sell}
        ]
        showPriceNotification(title, message, items)
      }
    }
    var getZebPayData = function(){
      return new Promise(function(success, failure){
        fetch('https://api.zebpay.com/api/v1/ticker?currencyCode=INR')
          .then(function(response){
            return response.json()
          }, function(error){
            throw error
          })
          .then(function(data){
              handleNotification(data)
              document.getElementsByName('zebpay_buy_price')[0].value = (data.buy * quantity_type_multiplier).toFixed(2);
              document.getElementsByName('zebpay_sell_price')[0].value = (data.sell * quantity_type_multiplier).toFixed(2);
              // document.getElementsByName('zebpay_net_buy_price')[0].value = (data.buy * quantity_hold * quantity_type_multiplier).toFixed(2);
              document.getElementsByName('zebpay_net_sell_price')[0].value = (data.sell * quantity_hold * quantity_type_multiplier).toFixed(2);
              document.getElementById('bitcoin-price-zebpay').innerText = document.getElementsByName('zebpay_buy_price')[0].value + '  /  ' + document.getElementsByName('zebpay_sell_price')[0].value;
              if(buy_price)
              if(parseInt(document.getElementsByName('zebpay_net_sell_price')[0].value) < parseInt(buy_price)){
                var zebpayItems = document.getElementsByClassName('zebpay-item')
                for(i = 0; i < zebpayItems.length; i++){
                  zebpayItems[i].style['background-color'] = '#e36802'
                }
              } else{
                var zebpayItems = document.getElementsByClassName('zebpay-item')
                for(i = 0; i < zebpayItems.length; i++){
                  zebpayItems[i].style['background-color'] = '#8ed8b8'
                }
              }
              success(data)
          }, function(error){
              console.log('zeb pay', error)
              failure(error)          
          })
      })
    }
    var getGoogleData = function(){
      return new Promise(function(success, failure){
        fetch('https://realtime-group-n-personal-chat.herokuapp.com/api/getBitcoinPrice')
          .then(function(response){
            return response.json()
          }, function(error){
            throw error
          })
          .then(function(data){
            // console.log('data goo', data);
            data.bpi.INR.rate = parseFloat(data.bpi.INR.rate.split(',').join(''))
            data = {
              buy : data.bpi.INR.rate,
              sell : data.bpi.INR.rate,

            }
            document.getElementsByName('coindesk_buy_price')[0].value = (data.buy * quantity_type_multiplier).toFixed(2);
            document.getElementsByName('coindesk_sell_price')[0].value = (data.sell * quantity_type_multiplier).toFixed(2);
            // document.getElementsByName('coindesk_net_buy_price')[0].value = (data.buy * quantity_hold * quantity_type_multiplier).toFixed(2);
            document.getElementsByName('coindesk_net_sell_price')[0].value = (data.sell * quantity_hold * quantity_type_multiplier).toFixed(2);
            if(buy_price)
            if(parseInt(document.getElementsByName('coindesk_net_sell_price')[0].value) < parseInt(buy_price)){
              var coindeskItems = document.getElementsByClassName('coindesk-item')
              for(i = 0; i < coindeskItems.length; i++){
                coindeskItems[i].style['background-color'] = '#e36802'
              }
            } else{
              var coindeskItems = document.getElementsByClassName('coindesk-item')
              for(i = 0; i < coindeskItems.length; i++){
                coindeskItems[i].style['background-color'] = '#8ed8b8'
              }
            }
            success(data)
          }, function(error){
            failure(error)
          })
      })
    }
    var getData = function(){
      document.getElementById('loading_indicator').style.display = ''
      quantity_hold = document.getElementsByName('quantity_hold')[0].value
      quantity_type_multiplier = document.getElementsByName('quantity_type')[0].value == 'btc' ? 1 : (1/1000000);
      buy_price = document.getElementsByName('buy_price')[0].value
      // console.log('hiiiiiiiii', quantity_hold, quantity_type_multiplier, buy_price)
      if(chrome.storage){
        chrome.storage.sync.set({
          quantity_type_multiplier : quantity_type_multiplier, 
          quantity_hold : quantity_hold, 
          quantity_type : document.getElementsByName('quantity_type')[0].value,
          buy_price : document.getElementsByName('buy_price')[0].value,
          buy_alarm : parseFloat(document.getElementsByName('buy_alarm')[0].value),
          sell_alarm : parseFloat(document.getElementsByName('sell_alarm')[0].value),
        });
      }
      Promise.all([
        getZebPayData(),
        getGoogleData()
      ]).then(function(data){
        document.getElementById('loading_indicator').style.display = 'none'
        var source = ['zebpay', 'coindesk'];
        // console.log('got data')
      })
    }
    if(chrome.storage){
      chrome.storage.sync.get(null, function(items){
        quantity_hold = document.getElementsByName('quantity_hold')[0].value = items.quantity_hold ? items.quantity_hold : 1;
        document.getElementsByName('quantity_type')[0].value = items.quantity_type ? items.quantity_type : 'btc'
        quantity_type_multiplier = items.quantity_type == 'btc' ? 1 : (items.quantity_type == 'bits' ? (1/1000000) : 0)
        document.getElementsByName('buy_price')[0].value = buy_price = items.buy_price ? items.buy_price : null

        document.getElementsByName('buy_alarm')[0].value = items.buy_alarm
        document.getElementsByName('sell_alarm')[0].value = items.sell_alarm

        setTimeout(getData, 0)
        setInterval(getData, 4000)
        document.getElementById('fetchDataButton').onclick = getData
      })
    } 
    else{
      quantity_hold = document.getElementsByName('quantity_hold')[0].value;
      quantity_type_multiplier = document.getElementsByName('quantity_type')[0].value == 'btc' ? 1 : (document.getElementsByName('quantity_type')[0].value == 'bits' ? (1/1000000) : 0)
      // console.log("document.getElementsByName('quantity_type')[0].value", document.getElementsByName('quantity_type')[0].value)
      // console.log('quantity_type_multiplierquantity_type_multiplier', quantity_type_multiplier)
      setTimeout(getData, 0)
      setInterval(getData, 4000)
      document.getElementById('fetchDataButton').onclick = getData
    }
    
  }

}())