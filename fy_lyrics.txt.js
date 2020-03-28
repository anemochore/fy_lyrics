// ==PREPROCESSOR==
// @name "fy_lyrics"
// @author "anemochore"
// @import "%fb2k_component_path%samples\complete\js\lodash.min.js"
// @import "%fb2k_component_path%samples\complete\js\helpers.js"
// @import "%fb2k_component_path%samples\complete\js\panel.js"

// @import "%fb2k_component_path%fy_lyrics\fy_settings.js"
// @import "%fb2k_component_path%fy_lyrics\user_settings.js"
// @import "%fb2k_component_path%fy_lyrics\lib\unorm.js"

// ==/PREPROCESSOR==

//ver 0.1. 19-12-22, finished prototype
//ver 0.2. 19-12-27, new-line issue fix
//ver 0.3. 19-12-30, seperates settings, noUse.ifHangulInTitle setting added, some setting changed, Gasazip added, setting and code refactoring
//ver 0.4. 19-12-31, setting and code refactoring
//ver 0.4.1. 19-12-31, setting and code refactoring
//ver 0.4.2. 20-1-1, setting and code refactoring
//ver 0.4.3. 20-1-1, AZlyrics disabled, artist and title searching improved
//ver 0.4.4. 20-3-28, mp3 v1 tag recognition bug fixed


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
    this.fetchingArtistAndHangulArtist = [];
    this.init();
  },

  getFilename: function(artist, title, siteName) {
    var artistAndTitle = artist + ' - ' + title;
    artistAndTitle = artistAndTitle.replace(/[\\\/:\*\?"<>\|]/g, '_');
    return filename = SAVE_FOLDER + '\\' + artistAndTitle + ' [' + siteName + '].txt';
  },

  containsHangul: function(str) {
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

  getArtistAndHangulArtist: function(artist) {
    //한글(영문) => [영문, 한글]
    //영문(한글) => [영문, 한글]
    //영문 => [영문, null]
    //한글 => [null, 한글]
    if(!artist)
      return [artist, null];

    var hangulArtist = artist.match(/\(([ㄱ-ㅎ|ㅏ-ㅣ|가-힣| ]+)\)$/) || artist.match(/(^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣| ]+)\(.+\)/);
    if(hangulArtist) {
      hangulArtist = hangulArtist[1];
      artist = artist.replace(hangulArtist, '');
      var possibleArtist = artist.match(/(.+)\(\)/);
      console.log(artist);
      if(possibleArtist) artist = possibleArtist[1].trim();
      else {
        var t = artist.match(/\((.+)\)/)
        if(t)  //to prevent mp3 v1 tag bug (maybe)
          artist = t[1];  
      }
    }
    else if(artist.match(/^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣| ]+$/)) {
      hangulArtist = artist;
      artist = null;
    }
    return [artist, hangulArtist];
  },
  
  replacePairs: function(str, regExpReplacePairs) {
    var result = str;
    for(var i=0; i<regExpReplacePairs.length; i++) 
      result = result.replace(regExpReplacePairs[i][0], regExpReplacePairs[i][1]);
    return result;
  },

  querySelectorAllOnStringReturningArray: function(value, q) {
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
      var data = Array.prototype.slice.call(div.querySelectorAll(q));

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
  if(panel.metadb) {
    var temp_artist = panel.tf('%artist%').trim();
    var temp_title = panel.tf('%title%').trim();
    if (that.artist == temp_artist && that.title == temp_title) 
      return;

    that.artist = temp_artist;
    that.title = temp_title;
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
  that.fetchingArtistAndHangulArtist = _.getArtistAndHangulArtist(artist);

  var results = [];
  fetch(0);

  function fetch(idx) {
    var currentSite = selectedSites[idx];
    console.log('____fetching ' + currentSite.name + ' (idx: ' + (idx+1) + ' of ' + selectedSites.length + ')____');

    var filename = _.getFilename(that.fetchingArtist, that.fetchingTitle, selectedSites[idx].name);
    if(_.isFile(filename)) {
      console.log(filename + ' already exists, so skip fetching.');
      results[idx] = ERRORS['FETCHING_ABORTED'];
      checkIfComplete(idx, that.fetchingArtist, that.fetchingTitle);
      return;
    }

    var nu = currentSite.noUse, ns = currentSite.noSearch, s = currentSite.searchResult;
    if((nu && nu.ifHangulInTitle && _.containsHangul(that.fetchingTitle)) ||
       (nu && nu.ifHangulInArtist && !that.fetchingArtistAndHangulArtist[0]) ||
       (nu && nu.ifHangulInArtist && that.fetchingArtistAndHangulArtist[0] && _.containsHangul(that.fetchingArtist)) ||
       (!that.fetchingArtistAndHangulArtist[0] && (ns && ns.noUseHangulArtistIfPresent || s && s.noUseHangulArtistIfPresent))) {
      console.log("'noUse.ifHangulInTitle' or 'noUse.ifHangulInArtist' or 'noUseHangulArtistIfPresent' triggered, so skip fetching.");
      results[idx] = ERRORS['FETCHING_ABORTED'];
      checkIfComplete(idx, that.fetchingArtist, that.fetchingTitle);
      return;
    }

    var query;
    if((ns && ns.noUseHangulArtistIfPresent) || (s && s.noUseHangulArtistIfPresent))
      query = that.fetchingArtistAndHangulArtist[0] || that.fetchingArtistAndHangulArtist[1];
    else 
      query = that.fetchingArtist;

    var url, pass;
    if(currentSite.noSearch) {
      String.prototype.normalizeToNFD_ = function() {
        if(_.containsHangul(this)) return this;
        else return this.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      }

      var ns = currentSite.noSearch;
      if(!ns.splitter)
        query += ' ' + that.fetchingTitle;  
      else 
        query += ns.splitter + that.fetchingTitle;
      if(ns.regExpReplacePairs)
        query = _.replacePairs(query, ns.regExpReplacePairs);
      if(ns.normalizeToNFD)
        query = query.normalizeToNFD_();
      if(ns.capitalize)
        query = query[0].toUpperCase() + query.toLowerCase().slice(1, query.length);
      if(ns.finalSuffix)
        query += ns.finalSuffix;

      url = currentSite.protocolAndHost + currentSite.pathnameAndSearch + query;  //no encodeURIComponent
      pass = 2;
    }
    else if(currentSite.searchResult) {
      var s = currentSite.searchResult;
      if(!s.splitter)
        query += ' ' + that.fetchingTitle;
      else 
        query += s.splitter + that.fetchingTitle;
      if(s.regExpReplacePairs)
        query = _.replacePairs(query, s.regExpReplacePairs);

      url = currentSite.protocolAndHost + currentSite.pathnameAndSearch + encodeURIComponent(query);
      pass = 1;
    }
    else {
      console.log("neither 'noSearch' nor 'searchResult' is specified on the setting.");
      results[idx] = ERRORS['SETTING_ERROR'];
      checkIfComplete(selectedSites.length, that.fetchingArtist, that.fetchingTitle);
      return;
    }

    var wtf = new ActiveXObject('Microsoft.XMLHTTP');
    wtf.open('GET', url, true);
    wtf.setRequestHeader('If-Modified-Since', 'Thu, 01 Jan 1970 00:00:00 GMT');
    wtf.send();
    wtf.onreadystatechange = function () {
      if (wtf.readyState == 4) {
        if (wtf.status == 200) {
          if(that.fetchingArtist == artist && that.fetchingTitle == title) {
            that_success(idx, currentSite, wtf.responseText, url, pass, that.fetchingArtistAndHangulArtist, that.fetchingTitle);  //responseXML is not supported...
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

  function that_success(idx, currentSite, txt, url, pass, thisArtistAndHangulArtist, thisTitle) {
    switch(pass) {
      case 1:  //first pass
        var newUrl;

        var s = currentSite.searchResult;
        switch(s.type) {
          case('list'):
            var artistToCheck = thisArtistAndHangulArtist[0];
            if(artistToCheck) artistToCheck = artistToCheck.toLowerCase();
            var artistHangulToCheck = thisArtistAndHangulArtist[1];
            var titleToCheck = thisTitle.toLowerCase();
            var listEls = _.querySelectorAllOnStringReturningArray(txt, s.query);
            var i, linkEl, titleEl, artistEl;
            var titleElTxt = titleToCheck, artistElTxt = artistToCheck, artistElTxtHan = artistHangulToCheck;
            for(i=0; i<listEls.length; i++) {
              if(s.linkQuery)
                linkEl = listEls[i].querySelector(s.linkQuery);
              else
                linkEl = listEls[i];

              if(s.titleQuery) {
                titleEl = listEls[i].querySelector(s.titleQuery);
                if(!titleEl) continue;
                if(s.titleQueryNode)
                  titleElTxt = titleEl[s.titleQueryNode].nodeValue.trim().toLowerCase();
                else
                  titleElTxt = titleEl.innerText.trim().toLowerCase();

                if(s.titleTextRegExpMatch) {
                  var tempTitle = titleElTxt.match(s.titleTextRegExpMatch);
                  if(tempTitle) titleElTxt = tempTitle[1];
                }
              }

              if(s.artistQuery) {
                artistEl = listEls[i].querySelector(s.artistQuery);
                if(!artistEl) continue;
                if(s.artistQueryNode)
                  artistElTxt = artistEl[s.artistQueryNode].nodeValue.trim().toLowerCase();
                else
                  artistElTxt = artistEl.innerText.trim().toLowerCase();

                if(s.artistTextRegExpMatch) {
                  var tempArtist = artistElTxt.match(s.artistTextRegExpMatch);
                  if(tempArtist) artistElTxt = tempArtist[1];
                }
                var tempArtistAndHangulArtist = _.getArtistAndHangulArtist(artistElTxt);
                artistElTxt = tempArtistAndHangulArtist[0];
                if(artistElTxt) artistElTxt = artistElTxt.toLowerCase();
                artistElTxtHan = tempArtistAndHangulArtist[1];
              }

              if((((artistToCheck && artistElTxt) && (artistToCheck == artistElTxt)) || 
                  ((artistHangulToCheck && artistElTxtHan) && (artistHangulToCheck == artistElTxtHan))) && 
                  titleToCheck == titleElTxt) break;
            }
            if(i < listEls.length)
              newUrl = checkAndModifyHrefOnElAndUpdateResultToo_(linkEl);
            else
              results[idx] = ERRORS['NO_RESULTS'];
            break;

          case('first'):
            var linkEl = _.querySelectorAllOnStringReturningArray(txt, s.query)[0];
            newUrl = checkAndModifyHrefOnElAndUpdateResultToo_(linkEl);
            break;

          default:
            console.log("'searchResult.type' is not recognized on the setting.");
            results[idx] = ERRORS['SETTING_ERROR'];
        }

        function checkAndModifyHrefOnElAndUpdateResultToo_(el) {
          if(!el || !el.href) {
            results[idx] = ERRORS['NO_RESULTS'];
            return null;
          }

          var testUrl;
          var s = currentSite.searchResult;
          if(s.onclickPathnameAndSearch) {
            var onclickJs = el.getAttribute('onclick');
            if(!onclickJs || !onclickJs.trim()) {
              console.log("no 'onclick' property on the element!");
              results[idx] = ERRORS['SETTING_ERROR'];
              return null;
            }
            if(s.onclickParamRegExpReplacePairs)
              onclickJs = _.replacePairs(onclickJs.trim(), s.onclickParamRegExpReplacePairs);

            testUrl = currentSite.protocolAndHost + s.onclickPathnameAndSearch + onclickJs;
            return testUrl;
          }

          //continues check when no onclick case
          testUrl = el.href;
          var currentProtocol = currentSite.protocolAndHost.slice(0,5);
          if(currentProtocol != 'https') currentProtocol = 'http';
          //handling unusual(?) or relative address case...
          if(testUrl.indexOf('http') != 0) {
            if(testUrl.indexOf('about://') == 0)  //case of AZlyrics (no result)
              testUrl = testUrl.replace('about://' , currentProtocol+'://');
            else if(testUrl.indexOf('about:/') == 0)  //case of SongMeanings, etc.
              testUrl = currentSite.protocolAndHost + testUrl.replace('about:/' , '/');
          }
          /*
          else {
            var pathname = searchResultLinkEl.pathname;
            if(pathname.indexOf('/') != 0) pathname = '/' + pathname;  //wtf...
            testUrl = currentSite.protocolAndHost + pathname;
          }
          */

          //if the site's protocol and the result's protocol is different then... 
          if(currentProtocol == 'https' && testUrl.slice(0,5) == 'http:')  //LyricWiki
            testUrl = testUrl.replace('http', 'https');
          else if(currentProtocol == 'http' && testUrl.slice(0,5) == 'https')  //???
            testUrl = testUrl.replace('https', 'http');

          if(testUrl == s.failResultUrl) {
            console.log("The result page was 'failResultUrl', so skipped.");
            results[idx] = ERRORS['NO_RESULTS'];
            return null;
          }

          return testUrl;
        }

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
          console.log('no search results');
          checkIfComplete(idx, that.fetchingArtist, that.fetchingTitle);
        }
        break;

      case 2:  //second pass
        console.log('opening lyrics url: ' + url + ' (idx: '+(idx+1) + ' of ' + selectedSites.length + ') success');
        var result = ERRORS['NO_RESULTS'], tempResult = '';

        var rp = currentSite.resultPage;
        if(!rp) {
          console.log("no 'resultPage' setting!");
          result = ERRORS['SETTING_ERROR'];
        }
        else {
          switch(rp.type) {
            case 'query':
              var resultPageEls = _.querySelectorAllOnStringReturningArray(txt, rp.query);
              var elTxt = '';
              for(var i=0; i<resultPageEls.length; i++) {
                if(!rp.useTextContent)
                  elTxt = resultPageEls[i].innerText.trim();
                else 
                  elTxt = resultPageEls[i].textContent.trim();
                if(elTxt) tempResult += elTxt;
                if(!rp.aggregateAll) break;  //run only once if resultPage.aggregateAll is false.
              }
              break;

            case 'script_parsing':
              var els = _.getElementsByTagName(txt, 'script');
              var elTxt = '';
              for(var i=0; i<els.length; i++) {
                var elHTML = els[i].innerHTML;
                var idx1 = elHTML.indexOf(rp.scriptFirstStrToFind);
                if(idx1 > -1) {
                  var idx2 = elHTML.slice(idx1).indexOf(rp.scriptEndStrToFind);
                  if(idx2 > -1) {
                    elTxt = elHTML.slice(idx1).slice(rp.scriptFirstStrToFind.length, idx2);
                    break;
                  }
                }
              }
              if(elTxt) tempResult = elTxt;
              break;

            default:
              console.log("'resultPage.type' is not recognized on the setting.");
              result = ERRORS['SETTING_ERROR'];
          }

          if(rp.regExpReplacePairs)
              tempResult = _.replacePairs(tempResult, rp.regExpReplacePairs);

          if(tempResult) {
            var er = currentSite.excludeResults;
            if(er && er.include) {
              var i;
              for(i=0; i<er.include.length; i++)
                if(tempResult.indexOf(er.include[i]) > -1) break;
              
              if(i<er.include.length) {
                console.log("found lyrics includes 'excludeResults' text.");
                tempResult = '';
              }
            }
            else if(er && er.match) {
              if(er.match.indexOf(tempResult) > -1) {
                console.log("found lyrics matches 'excludeResults'.");
                tempResult = '';
              }
            }
          }
          if(tempResult) result = tempResult;

          if(result == ERRORS['NO_RESULTS'])
            console.log('lyrics not found');
          else if(result == ERRORS['SETTING_ERROR'])
            console.log('please check the setting of ' + currentSite.name);
          else {
            console.log('lyrics found');
            if(txt.toLowerCase().indexOf(title.replace(/[\[\('!\.\/\?].*|feat.*/, '').toLowerCase().trim()) == -1)
              console.log('...with warning: possible wrong lyrics (no matching title text on the page)');
          }

          results[idx] = result;
          checkIfComplete(idx, that.fetchingArtist, that.fetchingTitle);
        }
        break;
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