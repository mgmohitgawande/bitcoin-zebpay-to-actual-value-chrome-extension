(function(){
  window.onload = function(){
    var saved_data = {}
    var quantity_hold = null;
    var quantity_type_multiplier = null;
    var buy_price = null;

    var getZebPayData = function(){
      return new Promise(function(success, failure){
        fetch('https://api.zebpay.com/api/v1/ticker?currencyCode=INR')
          .then(function(response){
            return response.json()
          }, function(error){
            throw error
          })
          .then(function(data){
              // console.log(data)
              document.getElementsByName('zebpay_buy_price')[0].value = (data.buy * quantity_type_multiplier).toFixed(2);
              document.getElementsByName('zebpay_sell_price')[0].value = (data.sell * quantity_type_multiplier).toFixed(2);
              document.getElementsByName('zebpay_net_buy_price')[0].value = (data.buy * quantity_hold * quantity_type_multiplier).toFixed(2);
              document.getElementsByName('zebpay_net_sell_price')[0].value = (data.sell * quantity_hold * quantity_type_multiplier).toFixed(2);
              console.log('hiiiiiii 3###########', parseInt(document.getElementsByName('zebpay_net_sell_price')[0].value), buy_price, parseInt(buy_price))
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
            document.getElementsByName('coindesk_net_buy_price')[0].value = (data.buy * quantity_hold * quantity_type_multiplier).toFixed(2);
            document.getElementsByName('coindesk_net_sell_price')[0].value = (data.sell * quantity_hold * quantity_type_multiplier).toFixed(2);
            
            console.log('hiiiiiii 3###########', parseInt(document.getElementsByName('coindesk_net_sell_price')[0].value), buy_price, parseInt(buy_price))
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
      console.log('hiiiiiiiii')
      document.getElementById('loading_indicator').style.display = ''
      quantity_hold = document.getElementsByName('quantity_hold')[0].value
      quantity_type_multiplier = document.getElementsByName('quantity_type')[0].value == 'btc' ? 1 : (1/1000000);
      buy_price = document.getElementsByName('buy_price')[0].value
      if(chrome.storage){
        chrome.storage.sync.set({
          quantity_type_multiplier : quantity_type_multiplier, 
          quantity_hold : quantity_hold, 
          quantity_type : document.getElementsByName('quantity_type')[0].value,
          buy_price : document.getElementsByName('buy_price')[0].value
        });
      }
      Promise.all([
        getZebPayData(),
        getGoogleData()
      ]).then(function(data){
        document.getElementById('loading_indicator').style.display = 'none'
        var source = ['zebpay', 'coindesk'];
        console.log('got data')
      })
    }
    if(chrome.storage){
      chrome.storage.sync.get(null, function(items){
        quantity_hold = document.getElementsByName('quantity_hold')[0].value = items.quantity_hold ? items.quantity_hold : 1;
        document.getElementsByName('quantity_type')[0].value = items.quantity_type ? items.quantity_type : 'btc'
        quantity_type_multiplier = items.quantity_type == 'btc' ? 1 : (items.quantity_type == 'bits' ? (1/1000000) : 0)
        document.getElementsByName('buy_price')[0].value = buy_price = items.buy_price ? items.buy_price : null
        setTimeout(getData, 0)
        setInterval(getData, 4000)
        document.getElementById('fetchDataButton').onclick = getData
      })
    } 
    else{
      quantity_hold = document.getElementsByName('quantity_hold')[0].value;
      quantity_type_multiplier = document.getElementsByName('quantity_type')[0].value == 'btc' ? 1 : (document.getElementsByName('quantity_type')[0].value == 'bits' ? (1/1000000) : 0)
      console.log("document.getElementsByName('quantity_type')[0].value", document.getElementsByName('quantity_type')[0].value)
      console.log('quantity_type_multiplierquantity_type_multiplier', quantity_type_multiplier)
      setTimeout(getData, 0)
      setInterval(getData, 4000)
      document.getElementById('fetchDataButton').onclick = getData
    }
    
  }

}())