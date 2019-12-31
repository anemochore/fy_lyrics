﻿// ==PREPROCESSOR==
// @name "fy_lyrics"
// @author "anemochore"
// @import "%fb2k_component_path%samples\complete\js\lodash.min.js"
// @import "%fb2k_component_path%samples\complete\js\helpers.js"
// @import "%fb2k_component_path%samples\complete\js\panel.js"

// @import "%fb2k_component_path%fy_lyrics\fy_settings.js"
// @import "%fb2k_component_path%fy_lyrics\user_settings.js"
// @import "%fb2k_component_path%fy_lyrics\lib\unorm.js"

// ==/PREPROCESSOR==

//ver 0.1, 19-12-22, finished prototype
//ver 0.2, 19-12-27, new-line issue fix
//ver 0.3, 19-12-30, seperates settings, noUseIfHanguel setting added, some setting changed, Gasazip added, setting and code refactoring
//ver 0.3.1, 19-12-30, small fixes, setting of LyricsMode fix


//setting
var selectedSites = [];
selectedSites = SITES.slice();
if(USER_SITES) selectedSites = selectedSites.concat(USER_SITES);
//selectedSites = [SITES[4]];  //dev

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

      panel.m.AppendMenuItem(panel.metadb && this.content ? MF_STRING : MF_GRAYED, 9999, 'Copy text to clipboard');
      panel.m.AppendMenuSeparator();
    }

    this.rbtn_up_done = function (value) {
      switch(value) {
        case 1999:
          WshShell.Run('explorer "' + SAVE_FOLDER.replace(/\\\\/g, '\\') + '"');
          break;
        case 9999:
          _.setClipboardData(this.content);
          break;
      }
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
  },

  getFilename: function(artist, title, siteName) {
    var artistAndTitle = artist + ' - ' + title;
    artistAndTitle = artistAndTitle.replace(/[\\\/:\*\?"<>\|]/g, '_');
    return filename = SAVE_FOLDER + '\\' + artistAndTitle + ' [' + siteName + '].txt';
  },

  contains_hangul: function(str) {
    //https://en.wikipedia.org/wiki/Hangul
    for(var i=0; i<str.length; i++) {
      c = str.charCodeAt(i);
      if( 0x1100<=c && c<=0x11FF ) return true;
      if( 0x3130<=c && c<=0x318F ) return true;
      if( 0xAC00<=c && c<=0xD7A3 ) return true;
      if( 0xA960<=c && c<=0xA97F ) return true;
      if( 0xD7B0<=c && c<=0xD7FF ) return true;
    }
    return false;
  },

  querySelectorAllOnString: function(value, q) {
    doc.open();
    var div = doc.createElement('div');
    div.innerHTML = value;

    if(q.indexOf(':not(') > -1) { //:not() selector not supported... wtf
      var idx1 = q.indexOf(':not(');
      var t1 = q.slice(idx1+5);
      var idx2 = t1.indexOf(')');
      var t2 = t1.slice(0, idx2);
      var q1 = q.replace(':not('+t2+')', '');  //query without the params of :not()
      var q2 = q1 + t2;                        //query without :not()
      var data1 = Array.prototype.slice.call(div.querySelectorAll(q1));
      var data2 = Array.prototype.slice.call(div.querySelectorAll(q2));
      var data = [];
      for(var i=0; i<data1.length; i++)
        if(data2.indexOf(data1[i]) == -1)
          data.push(data1[i]);
    }
    else 
      var data = div.querySelectorAll(q);

    doc.close();
    return data;
  },

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


//modified js
function on_metadb_changed() {
  var that = text;
  if (panel.metadb) {
    var temp_artist = panel.tf('%artist%');
    var temp_title = panel.tf('%title%');
    if (that.artist == temp_artist && that.title == temp_title) 
      return;

    that.artist = temp_artist;
    that.title = temp_title;
    //console.log('triggered: ' + that.artist + ' - ' + that.title);
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
  that.isFetching = true;
  that.fetchingArtist = artist;
  that.fetchingTitle = title;

  var results = [];
  fetch(0);

  function fetch(idx) {
    var currentSite = selectedSites[idx];
    console.log('____fetching idx: ' + (idx+1) + ' of ' + selectedSites.length);

    var filename = _.getFilename(that.fetchingArtist, that.fetchingTitle, selectedSites[idx].name);
    if(_.isFile(filename)) {
      console.log(filename + ' already exists, so skip fetching.');
      results[idx] = ERRORS['FETCHING_ABORTED'];
      checkIfComplete(idx, that.fetchingArtist, that.fetchingTitle);
      return;
    }

    var containsHangul = _.contains_hangul(that.fetchingArtist + that.fetchingTitle);
    if(containsHangul && currentSite.noUseIfHanguel) {
      console.log("'noUseIfHanguel' of " + currentSite.name + ' triggered, so skip fetching.');
      results[idx] = ERRORS['FETCHING_ABORTED'];
      checkIfComplete(idx, that.fetchingArtist, that.fetchingTitle);
      return;
    }

    var artistAndTitle = artist + ' ' + title;
    if(currentSite.searchRegExpAndStrPairToReplace)
      artistAndTitle = artistAndTitle.replace(currentSite.searchRegExpAndStrPairToReplace[0], currentSite.searchRegExpAndStrPairToReplace[1]);
    var url = currentSite.protocolAndHost + currentSite.pathnameAndSearch + encodeURIComponent(artistAndTitle);
    var pass = 1;
    if(currentSite.noSearch) {
      String.prototype.replaceStrPairs_ = function(strPairs) {
        var result = this;
        for(var i=0;i<strPairs.length;i++) 
          result = result.replace(new RegExp(strPairs[i][0], 'g'), strPairs[i][1]);
        return result;
      }

      String.prototype.normalizeToNFD_ = function() {
        //from https://stackoverflow.com/a/37511463/6153990
        // and https://github.com/walling/unorm
        if(_.contains_hangul(this)) return this;
        else return this.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      }

      var query = artist;
      if(currentSite.noSearchSplitter)
        query += currentSite.noSearchSplitter + title;
      else 
        query += ' ' + title;
      if(currentSite.noSearchRegExpAndStrPairToReplace)
        query = query.replace(currentSite.noSearchRegExpAndStrPairToReplace[0], currentSite.noSearchRegExpAndStrPairToReplace[1]);
      if(currentSite.noSearchAdditionalStrPairsToReplace)
        query = query.replaceStrPairs_(currentSite.noSearchAdditionalStrPairsToReplace);
      if(currentSite.noSearchNormalizeToNFD)
        query = query.normalizeToNFD_();
      if(currentSite.noSearchCapitalize)
        query = query[0].toUpperCase() + query.toLowerCase().slice(1, query.length);
      if(currentSite.noSearchFinalSuffix)
        query += currentSite.noSearchFinalSuffix;

      url = currentSite.protocolAndHost + '/' + query;  //no encodeURIComponent
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
            checkIfComplete(selectedSites.length, that.fetchingArtist, that.fetchingTitle, "aborted!");
          }
        } else {
          console.log('opening ' + url + ' (idx: '+ (idx+1) + ' of ' + selectedSites.length + ') failed!');
          results[idx] = ERRORS['CANNOT_ACCESS'];
          checkIfComplete(idx, that.fetchingArtist, that.fetchingTitle);
        }
      }
    };
  }

  function that_success(idx, currentSite, txt, url, pass) {
    if(pass == 1) {  //first pass
      var parentElTxt = txt;
      if(currentSite.firstResultLinkParentElQuery) {
        var elsToKeep = 1;
        if(currentSite.firstResultLinkParentElNumberToSkipIfMultiple) 
          elsToKeep = currentSite.firstResultLinkParentElNumberToSkipIfMultiple + 1;

        parentElTxt = _.querySelectorAllOnString(txt, currentSite.firstResultLinkParentElQuery);//, currentSite.firstResultLinkParentElObj, elsToKeep);
        if(parentElTxt.length > 1)
          parentElTxt = parentElTxt[elsToKeep-1].innerHTML;
        else 
          parentElTxt = parentElTxt[0].innerHTML;
      }

      var firstResultLinkEl = _.querySelectorAllOnString(parentElTxt, currentSite.firstResultLinkElQuery)[0];
      var newUrl;
      if(firstResultLinkEl && firstResultLinkEl.href) {
        //check if url is valid
        newUrl = firstResultLinkEl.href;
        if(currentSite.firstResultLinkElOnclickRegExpAndStrPairToReplace) {
          var js = firstResultLinkEl.getAttribute('onclick');
          if(!js || !js.trim()) {
            console.log("no 'onclick' property on firstResultLinkEl on " + currentSite.name);
            results[idx] = ERRORS['SETTING_ERROR'];
          }
          js = js.replace(currentSite.firstResultLinkElOnclickRegExpAndStrPairToReplace[0], currentSite.firstResultLinkElOnclickRegExpAndStrPairToReplace[1]).trim();

          newUrl = currentSite.resultPagePathnameAndSearch;
          if(!newUrl || !newUrl.trim()) {
            console.log("no 'resultPagePathnameAndSearch' in the setting on " + currentSite.name + ' setting!');
            results[idx] = ERRORS['SETTING_ERROR'];
          }
          newUrl = currentSite.protocolAndHost + newUrl + js;
        }
        else {
          var currentProtocol = currentSite.protocolAndHost.slice(0,5);
          if(currentProtocol != 'https') currentProtocol = 'http';
          //handling unusual(?) or relative address case...
          if(newUrl.indexOf('http') != 0) {
            if(newUrl.indexOf('about://') == 0)  //case of AZlyrics (no result)
              newUrl = newUrl.replace('about://' , currentProtocol+'://');
            else if(newUrl.indexOf('about:/') == 0)  //case of SongMeanings, etc.
              newUrl = currentSite.protocolAndHost + newUrl.replace('about:/' , '/');
          }
          /*
          else {
            var pathname = firstResultLinkEl.pathname;
            if(pathname.indexOf('/') != 0) pathname = '/' + pathname;  //wtf...
            newUrl = currentSite.protocolAndHost + pathname;
          }
          */

          //if the site's protocol and the result's protocol is different then... 
          if(currentProtocol == 'https' && newUrl.slice(0,5) == 'http:')  //LyricWiki
            newUrl = newUrl.replace('http', 'https');
          else if(currentProtocol == 'http' && newUrl.slice(0,5) == 'https')  //???
            newUrl = newUrl.replace('https', 'http');

          if(newUrl == currentSite.failResultUrl) {
            console.log("result page was 'failResultUrl'");
            results[idx] = ERRORS['NO_RESULTS'];
          }
        }
      }
      else 
        results[idx] = ERRORS['NO_RESULTS'];

      if(!results[idx] && newUrl) {
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
      else {
        console.log('no search results on ' + currentSite.name);
        checkIfComplete(idx, that.fetchingArtist, that.fetchingTitle);
      }
    }
    else if(pass == 2) {  //second pass
      console.log('opening lyrics url: ' + url + ' (idx: '+(idx+1) + ' of ' + selectedSites.length + ') success');
      var result = ERRORS['NO_RESULTS'];

      var parentElTxt = txt;
      if(currentSite.resultPageParentElQuery) {
        var elsToKeep = 1;
        if(currentSite.resultPageParentElNumberToSkipIfMultiple)
          elsToKeep = currentSite.resultPageParentElNumberToSkipIfMultiple + 1;

        parentElTxt = _.querySelectorAllOnString(txt, currentSite.resultPageParentElQuery);
        if(parentElTxt.length > 1)
          parentElTxt = parentElTxt[elsToKeep-1].innerHTML;
        else 
          parentElTxt = parentElTxt[0].innerHTML;
      }

      var tempResult = '';
      if(currentSite.resultPageElQuery) {
        if(currentSite.resultPageScriptStartsWith) {
          console.log("'resultPageElQuery' and 'resultPageScriptStartsWith' cannot be specified at the same time.");
          result = ERRORS['SETTING_ERROR'];
        }
        else {
          var resultPageEls = _.querySelectorAllOnString(parentElTxt, currentSite.resultPageElQuery);
          var elTxt = '';
          for(var i=0; i<resultPageEls.length; i++) {
            var resultPageEl = resultPageEls[i];
            if(resultPageEl && resultPageEl.innerText) {
              elTxt = resultPageEl.innerText.trim();
              if(currentSite.useTextContent && resultPageEl.textContent)
                elTxt = resultPageEl.textContent.trim();
            }
            if(elTxt) tempResult += elTxt;
            if(!currentSite.resultPageTakeAllEl) break;  //run only once if resultPageTakeAllEl is false.
          }
        }
      }
      else if(currentSite.resultPageScriptStartsWith) {
        var els = _.getElementsByTagName(parentElTxt, 'script');
        var elTxt = '';
        for(var i=0; i<els.length; i++) {
          var elHTML = els[i].innerHTML;
          var idx1 = elHTML.indexOf(currentSite.resultPageScriptFirstStrToFind);
          if(idx1 > -1) {
            var idx2 = elHTML.slice(idx1).indexOf(currentSite.resultPageScriptEndStrToFind);
            if(idx2 > -1) {
              elTxt = elHTML.slice(idx1).slice(currentSite.resultPageScriptFirstStrToFind.length, idx2);
              break;
            }
          }
        }
        if(elTxt) tempResult = elTxt.replace(/\\n/g, '\n');
      }

      if(tempResult) {
        if(currentSite.excludeResultsInclude) {
          var i;
          for(i=0; i<currentSite.excludeResultsInclude.length; i++)
            if(tempResult.indexOf(currentSite.excludeResultsInclude[i]) > -1) break;
          
          if(i<currentSite.excludeResultsInclude.length) {
            console.log("found lyrics was included in 'excludeResultsInclude'");
            tempResult = '';
          }
        }
        else if(currentSite.excludeResultsMatch) {
          if(currentSite.excludeResultsMatch && currentSite.excludeResultsMatch.indexOf(tempResult) > -1) {
            console.log("found lyrics was included in 'excludeResultsMatch'");
            tempResult = '';
          }
        }

        if(currentSite.resultRegExpAndStrPairToReplace)
          tempResult = tempResult.replace(currentSite.resultRegExpAndStrPairToReplace[0], currentSite.resultRegExpAndStrPairToReplace[1]);
      }
      
      if(tempResult) result = tempResult;

      if(result == ERRORS['NO_RESULTS'])
        console.log('lyrics not found on ' + currentSite.name);
      else if(result == ERRORS['SETTING_ERROR'])
        console.log('please check the setting of ' + currentSite.name);
      else {
        console.log('lyrics found on ' + currentSite.name);
        if(txt.toLowerCase().indexOf(title.replace(/[\[\('!\.\/\?].*|feat.*/, '').toLowerCase().trim()) == -1)
          console.log('...with warning: possible wrong lyrics (no matching title text on the page)');
      }

      results[idx] = result;
      checkIfComplete(idx, that.fetchingArtist, that.fetchingTitle);
    }

  }

  function checkIfComplete(idx, fetchingArtist, fetchingTitle, isAborted) {
    //end condition check
    if(isAborted || idx + 1 >= selectedSites.length)
      write(results, fetchingArtist, fetchingTitle, isAborted);
    else 
      fetch(idx + 1);
  }

}


//save lyrics
function write(results, fetchingArtist, fetchingTitle, isAborted) {
  var that = text;
  var content = '';

  if(isAborted) 
    content = 'fetching aborted and restarting...';
  else {
    console.log('done!');
    that.isFetching = false;

    var keys = Object.keys(ERRORS), vals = [];
    for(var i=0; i<keys.length; i++)
      vals[i] = ERRORS[keys[i]];

    for(var i=0; i<results.length; i++) {
      if(vals.indexOf(results[i]) == -1) {
        var filename = _.getFilename(fetchingArtist, fetchingTitle, selectedSites[i].name);

        if(utils.WriteTextFile(filename, results[i])) {
          content += 'Lyrics from ' + selectedSites[i].name + ' saved on the save folder.\n';
          console.log('Lyrics from ' + selectedSites[i].name + ' saved on the save folder.');
        }
        else 
          console.log('Error saving to ' + filename);
      }
    }
    if(!content) content = 'no (new) lyrics found :(';
  }
  
  that.content = content;
  window.Repaint();
  panel.item_focus_change();
}
