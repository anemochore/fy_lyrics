// ==PREPROCESSOR==
// @name "fy get lyrics"
// @author "anemochore"
// @import "%fb2k_component_path%samples\complete\js\lodash.min.js"
// @import "%fb2k_component_path%samples\complete\js\helpers.js"
// @import "%fb2k_component_path%samples\complete\js\panel.js"

// @import "%fb2k_component_path%scripts\fy_settings.js"
// @import "%fb2k_component_path%scripts\unorm.js"
// ==/PREPROCESSOR==

//ver 0.1, 19-12-22, finished prototype


//setting
var selectedSites = [];
selectedSites = SITES.slice();
//selectedSites.push(SITES[0]);  //dev  //todo

var ERRORS = {
  CANNOT_ACCESS: 'cannot access -_-',
  NO_RESULTS: 'no results -_-',
  SETTING_ERROR: 'setting error -_-',
  FETCHING_ABORTED: 'fetching aborted -_-'
};


//JScript panel boilerplates (based on text.js)
_.mixin({
  text : function (x, y, w, h) {
    this.init = function () {
      this.is_match = function (artist, title) {
        if (!panel.metadb) return false;

        return this.tidy(artist) == this.tidy(this.artist) && this.tidy(title) == this.tidy(this.title);
      }

      this.tidy = function (value) {
        var tfo = fb.TitleFormat('$replace($lower($ascii(' + _.fbEscape(value) + ')), & ,, and ,)');
        var str = tfo.EvalWithMetadb(panel.metadb);
        _.dispose(tfo);
        return str;
      }
    }

    this.rbtn_up = function (x, y) {
      panel.m.AppendMenuItem(_.isFolder(SAVE_FOLDER) ? MF_STRING : MF_GRAYED, 1999, 'Open the save folder');
      panel.m.AppendMenuSeparator();
    }

    this.rbtn_up_done = function (value) {
      WshShell.Run('explorer "' + SAVE_FOLDER.replace(/\\\\/g, '\\') + '"');
    }

    panel.text_objects.push(this);
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.content = 'fy_lyrics ready.';
    this.artist = '';
    this.title = '';
    this.xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
    this.properties = {};
    this.isFetching = false;
    this.fetchingArtist = '';
    this.fetchingTitle = '';
    this.init();
  }
});


//JScript panel boilerplates (based on allmusic review.txt)
var panel = new _.panel();
var text = new _.text(LM, TM, 0, 0);

function on_size() {
  var that = text;
  panel.size();
  that.w = panel.w - (LM * 2);
  that.h = panel.h - TM;
}

function on_paint(gr) {
  var that = text;
  panel.paint(gr);
  gr.GdiDrawText(panel.tf('%artist%[ - %title%]')+' __fy_lyrics__', panel.fonts.title, panel.colours.highlight, LM, 0, panel.w - (LM * 2), TM, LEFT);
  gr.DrawLine(that.x, that.y + 1, that.x + that.w, that.y + 1, 1, panel.colours.highlight);
  gr.GdiDrawText(that.content, panel.fonts.normal, panel.colours.text, LM, _.scale(24), that.w, that.h, LEFT);
}

function on_mouse_rbtn_up(x, y) {
  return panel.rbtn_up(x, y, text);
}


//modified JSCript
function on_metadb_changed() {
  var that = text;
  if (panel.metadb) {
    var temp_artist = panel.tf('%artist%');
    var temp_title = panel.tf('%title%');
    if (that.artist == temp_artist && that.title == temp_title) 
      return;

    that.artist = temp_artist;
    that.title = temp_title;
    console.log('triggered: ' + that.artist + ' - ' + that.title);
    that_get(that.artist, that.title);
  } else {
    that.artist = '';
    that.title = '';
    that.content = '';
    that.fetchingArtist = '';
    that.fetchingTitle = '';
  }
  window.Repaint();
}

function that_get(artist, title) {
  var that = text;
  if(that.isFetching && that.fetchingArtist == artist && that.fetchingTitle == title) return;

  that.content = 'Fetching... please wait. See the Console for the detail.';
  window.Repaint();


  //fetch
  var results = [];
  that.isFetching = true;
  that.fetchingArtist = artist;
  that.fetchingTitle = title;
  fetch(0);

  function fetch(idx) {
    console.log('fetching idx: ' + (idx+1) + ' of ' + selectedSites.length);
    var currentSite = selectedSites[idx];
    var url = currentSite.protocolAndHost + currentSite.pathnameAndSearch + encodeURIComponent(artist + ' ' + title);
    var pass = 1;
    if(currentSite.noSearch) {
      String.prototype.ifNull_ = function(str) {
        return this ? this : str;
      }

      String.prototype.replaceStrPairs_ = function(strPairs) {
        var result = this;
        for(var i=0;i<strPairs.length;i++) 
          result = result.replace(new RegExp(strPairs[i][0], 'g'), strPairs[i][1]);
        return result;
      }

      String.prototype.normalizeToNFD_ = function() {
        //from https://stackoverflow.com/a/37511463/6153990
        // and https://github.com/walling/unorm
        return this.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      }
      
      var query = artist + currentSite.splitter.ifNull_(' ') + title;
      query = query.replace(currentSite.regExpToRemove, '').replaceStrPairs_(currentSite.strPairsToReplace);
      if(currentSite.normalizeToNFD) query = query.normalizeToNFD_();
      if(currentSite.capitalize) query = query[0].toUpperCase() + query.toLowerCase().slice(1, query.length);
      query += currentSite.finalSuffix.ifNull_('');
      //console.log('query: '+ query);

      url = currentSite.protocolAndHost + '/' + query;  //no encodeURIComponent
      //console.log('url: '+ url);
      pass = 2;
    }

    var wtf = new ActiveXObject('Microsoft.XMLHTTP');
    wtf.open('GET', url, true);
    wtf.setRequestHeader('If-Modified-Since', 'Thu, 01 Jan 1970 00:00:00 GMT');
    wtf.send();
    wtf.onreadystatechange = function () {
      if (wtf.readyState == 4) {
        if (wtf.status == 200) {
          if(that.fetchingArtist == artist && that.fetchingTitle == title) {
            that_success(idx, currentSite, wtf.responseText, url, pass);  //responseXML is not supported...
          }
          else {
            results[idx] = ERRORS['FETCHING_ABORTED'];
            console.log('fetching aborted.');
            checkIfComplete(selectedSites.length, that.fetchingArtist, that.fetchingTitle, "aborted");
          }
        } else {
          console.log('opening ' + url + ' (idx: '+ idx + ' of ' + selectedSites.length + ') failed!');
          results[idx] = ERRORS['CANNOT_ACCESS'];
          checkIfComplete(idx, that.fetchingArtist, that.fetchingTitle);
        }
      }
    };
  }

  function that_success(idx, currentSite, txt, url, pass) {
    //console.log('opening ' + url + ' (idx: '+(idx+1) + ' of ' + selectedSites.length + ') success');
    if(pass == 1) {  //first pass
      var parentElTxt = txt;
      if(currentSite.firstResultLinkParentElTag) {
        var elsToKeep = 1;
        if(currentSite.firstResultLinkParentElNumberToSkipIfMultiple) 
          elsToKeep = currentSite.firstResultLinkParentElNumberToSkipIfMultiple + 1;

        parentElTxt = fyFilter_(_.getElementsByTagName(txt, currentSite.firstResultLinkParentElTag), currentSite.firstResultLinkParentElObj, elsToKeep);
        if(parentElTxt.length > 1)
          parentElTxt = parentElTxt[elsToKeep-1].innerHTML;
        else 
          parentElTxt = parentElTxt[0].innerHTML;
      }

      var firstResultLinkEl = fyFilter_(_.getElementsByTagName(parentElTxt, 'a'), currentSite.firstResultLinkElObj)[0];
      if(!firstResultLinkEl || !firstResultLinkEl.href) {
        console.log('no search results on ' + currentSite.name);
        results[idx] = ERRORS['NO_RESULTS'];
        checkIfComplete(idx, that.fetchingArtist, that.fetchingTitle);
      }
      else {
        var newUrl = firstResultLinkEl.href;
        if(currentSite.firstResultLinkElOnclickStringsToRemove) {
          var js = firstResultLinkEl.getAttribute('onclick');
          if(!js || !js.trim()) {
            console.log("no 'onclick' property on firstResultLinkEl on " + currentSite.name + ' setting!');
            results[idx] = ERRORS['SETTING_ERROR'];
            checkIfComplete(idx, that.fetchingArtist, that.fetchingTitle);
          }
          for(var i=0; i<currentSite.firstResultLinkElOnclickStringsToRemove.length; i++) 
            js = js.replace(currentSite.firstResultLinkElOnclickStringsToRemove[i], '');

          newUrl = currentSite.resultPagePathnameAndSearch;
          if(!newUrl || !newUrl.trim()) {
            console.log("no 'resultPagePathnameAndSearch' in the setting on " + currentSite.name + ' setting!');
            results[idx] = ERRORS['SETTING_ERROR'];
            checkIfComplete(idx, that.fetchingArtist, that.fetchingTitle);
          }
          newUrl = currentSite.protocolAndHost + newUrl + js;
        }
        else {
          //handling unusual(?) or relative address case...
          if(newUrl.indexOf('http') != 0) {
            if(newUrl.indexOf('about:') == 0) {  //case of songmeanings.com, etc.
              newUrl = currentSite.protocolAndHost + newUrl.replace('about:' , '');
            }
            else {
              var pathname = firstResultLinkEl.pathname;
              if(pathname.indexOf('/') != 0) pathname = '/' + pathname;  //wtf...
              newUrl = currentSite.protocolAndHost + pathname;
            }
          }

          //if the site's protocol and the result's protocol is different then... (case of LyricWiki)
          if(currentSite.protocolAndHost.slice(0,5) != newUrl.slice(0,5)) {
            if(currentSite.protocolAndHost.slice(0,5) == 'https')
              newUrl = newUrl.replace('http', 'https');
            else 
              newUrl = newUrl.replace('https', 'http');
          }
        }

        //console.log('lyrics url: ' + newUrl);
        var wtf = new ActiveXObject('Microsoft.XMLHTTP');
        wtf.open('GET', newUrl, true);
        wtf.setRequestHeader('If-Modified-Since', 'Thu, 01 Jan 1970 00:00:00 GMT');
        wtf.send();
        wtf.onreadystatechange = function () {
          if (wtf.readyState == 4) {
            if (wtf.status == 200) {
              if(that.fetchingArtist == that.artist && that.fetchingTitle == that.title) {
                that_success(idx, currentSite, wtf.responseText, newUrl, 2);
              }
              else {
                results[idx] = ERRORS['FETCHING_ABORTED'];
                console.log('fetching aborted.');
                checkIfComplete(selectedSites.length, that.fetchingArtist, that.fetchingTitle, "aborted");
              }
            } else {
              console.log('opening ' + newUrl + ' (idx: ' + (idx+1) + ' of ' + selectedSites.length + ') failed!');
              results[idx] = ERRORS['CANNOT_ACCESS'];
              checkIfComplete(idx, that.fetchingArtist, that.fetchingTitle);
            }
          }
        };
      }
    }
    else if(pass == 2) {  //second pass
      var result = ERRORS['NO_RESULTS'];
      if(txt.toLowerCase().indexOf(title.toLowerCase()) == -1) {
        console.log('dev: wrong lyrics (no matching title)');
      }
      else {
        var parentElTxt = txt;
        if(currentSite.resultPageParentElTag) {
          var elsToKeep = 1;
          if(currentSite.resultPageParentElNumberToSkipIfMultiple)
            elsToKeep = currentSite.resultPageParentElNumberToSkipIfMultiple + 1;

          parentElTxt = fyFilter_(_.getElementsByTagName(txt, currentSite.resultPageParentElTag), currentSite.resultPageParentElObj, elsToKeep);
          if(parentElTxt.length > 1)
            parentElTxt = parentElTxt[elsToKeep-1].innerHTML;
          else 
            parentElTxt = parentElTxt[0].innerHTML;
        }

        var resultPageEl = fyFilter_(_.getElementsByTagName(parentElTxt, currentSite.resultPageElTag), currentSite.resultPageElObj)[0];
        if(resultPageEl && resultPageEl.innerText) {
          result = resultPageEl.innerText.trim();
          
          //todo: 지니 또는 뮤직매치에서 개행문자 처리
          if(currentSite.useTextContent && resultPageEl.textContent)
            result = resultPageEl.textContent.trim();

          //console.log('innerText: '+resultPageEl.innerText.trim());
          //console.log('innerText n: '+resultPageEl.innerHTML.trim().indexOf('\\n'));
          //console.log('innerText n2: '+resultPageEl.innerText.trim().indexOf('\\\n'));
          //console.log('innerText r: '+resultPageEl.innerText.trim().indexOf('\r'));
          //console.log('innerText rn: '+resultPageEl.innerText.trim().indexOf('\r\n'));
          //console.log('innerText 13: '+resultPageEl.innerText.trim().indexOf(String.fromCharCode(13)));
          //console.log('textContent: '+resultPageEl.textContent.trim());

          if(currentSite.excludeResults && currentSite.excludeResults.indexOf(result) > -1) {
            console.log('dev: empty lyrics');
            result = ERRORS['NO_RESULTS'];
          }
        }
      }

      if(result == ERRORS['NO_RESULTS']) 
        console.log('lyrics not found on ' + currentSite.name);
      else 
        console.log('lyrics found on ' + currentSite.name);

      results[idx] = result;
      checkIfComplete(idx, that.fetchingArtist, that.fetchingTitle);
    }
  }

  function checkIfComplete(idx, fetchingArtist, fetchingTitle) {
    //end condition check
    if(idx + 1 >= selectedSites.length)
      write(results, fetchingArtist, fetchingTitle);
    else 
      fetch(idx + 1);
  }

  function fyFilter_(arr, oneKeyObj, elsToKeep) {
    //console.log('arr.length: ' + arr.length + ' / elsToKeep: '+elsToKeep);
    if(!arr) return arr[0];

    var key = null, val = null;
    if(oneKeyObj) {
      key = Object.keys(oneKeyObj)[0];
      val = oneKeyObj[key];
    }
    //console.log('key: ' + key + ' / val: ' + val);

    if(!elsToKeep) elsToKeep = 1;
    var result = [], count = 0;
    for(var i=0; i<arr.length; i++) {
      //console.log('arr['+i+']: '+arr[i].innerText+' / arr[i].getAttribute(key): '+arr[i].getAttribute(key)+' / if: '+(arr[i].getAttribute(key) == val));
      if(arr[i].getAttribute(key) == val) {
        result.push(arr[i]);
        count += 1;
        if(count >= elsToKeep) break;
      }
    }
    //console.log('result.length: ' + result.length);
    return result;
  }
  
}


//save lyrics
function write(results, fetchingArtist, fetchingTitle, isAborted) {
  var that = text;
  var content = '';

  if(isAborted) 
    content = 'fetching aborted...';
  else {
    console.log('done!');
    that.isFetching = false;

    var keys = Object.keys(ERRORS), vals = [];
    for(var i=0; i<keys.length; i++)
      vals[i] = ERRORS[keys[i]];
    
    
    for(var i=0; i<results.length; i++) {
      if(vals.indexOf(results[i]) == -1) {
        var filename = SAVE_FOLDER + '\\' + fetchingArtist + ' - ' + fetchingTitle + ' [' + selectedSites[i].name + '].txt';
        if(_.isFile(filename)) {
          content += 'Lyrics from ' + selectedSites[i].name + ' already exists on the save folder.\n';
          console.log(filename + ' already exists.');
        }
        else if(utils.WriteTextFile(filename, results[i])) {
          content += 'Lyrics from ' + selectedSites[i].name + ' saved on the save folder.\n';
          console.log('Lyrics from ' + selectedSites[i].name + ' saved on the save folder.');
        }
        else 
          console.log('Error saving to ' + filename);
      }
    }
    if(!content) content = 'no lyrics found :(';
  }
  
  that.content = content;
  window.Repaint();
  panel.item_focus_change();
}
