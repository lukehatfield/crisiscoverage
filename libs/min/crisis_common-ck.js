function currentCrisisEvaluator(){var e=!1;localStorage.getItem("current_crisis")||localStorage.setItem("current_crisis","haiyan"),!window.crisis_select.value||firstTime?(console.log("--> updating new window.crisis_select variable to reflect localStorage: "+localStorage.getItem("current_crisis")),window.crisis_select.value=localStorage.getItem("current_crisis"),firstTime=!1,e=!0):localStorage.getItem("current_crisis")!==window.crisis_select.value&&(console.log("--> updating localStorage 'current_crisis' variable to reflect new selection: "+window.crisis_select.value),localStorage.setItem("current_crisis",window.crisis_select.value),e=!0),e&&(window.crisis_select.className=window.crisis_select.value)}function addClassNameListener(e,t){var r=document.getElementById(e),i=r.className;window.setInterval(function(){var e=r.className;e!==i&&(t(),i=e)},10)}function numberWithCommas(e){if(isNaN(e))return e;var t=e.toString().split(".");return t[0]=t[0].replace(/\B(?=(\d{3})+(?!\d))/g,","),t.join(".")}function resetSummary(e){console.log("summary called"),d3.select("#crisisTitle").data(e).html(function(e){return"<h3>"+e.title+"</h3>"}),d3.select("#crisisStory").data(e).html(function(e){return"<p>"+e.content+"</p>"})}var firstTime=!0;String.prototype.replaceAll=function(e,t){var r=this;return r.replace(new RegExp(e.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&"),"g"),t)};