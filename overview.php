<?php include 'includes/head.html'; ?>

<body id="overview">

<!-- ADDITIONAL JS LIBS -->
<script type="text/javascript" src="libs/jquery-1.10.1.js"></script>
<script type="text/javascript" src="libs/html5jtabs.js"></script>
<script type="text/javascript" src="libs/jquery.jscrollpane.min.js"></script>
<script type="text/javascript" src="libs/jquery.mousewheel.js"></script>
<script type="text/javascript" src="libs/colorlegend.js"></script>

<link type="text/css" href="css/jquery.jscrollpane.css" rel="stylesheet" media="all" />

<!--TODO: STYLE FOR THIS PAGE, INCORPORATE INTO CSS ??? -->
<style>

/* Tooltips */
  .d3-tip {
        line-height: 1;
        font-weight: bold;
        padding: 12px;
        background: rgba(0, 0, 0, 0.8);
        color: #fff;
        border-radius: 2px;
    }

    //create a small triangle extender for the tooltip
    .d3-tip:after {
        box-sizing: border-box;
        display: inline;
        font-size: 10px;
        width: 100%;
        line-height: 1;
        background: rgba(0, 0, 0, 0.8);
        content: "\25BC";
        position: absolute;
        text-align: center;
    }

    //style northward tooltips differently
    .d3-tip.n:after {
        margin: -1px 0 0 0;
        top: 100%;
        left: 0;
    }

    //no arrow
    .d3-tip.none:after {
        opacity: 0;
    }

    /* Legend */
      .legend {
                background-color: #fff;
                width: 350px;
                height: 50px;
               /* border: 1px solid #bbb; */
                margin:0 auto;
            }

            #quantileLegend .colorlegend-labels {
                font-size: 11px;
                fill: black;
            }
    /* Tabs */
      #overview_content{
        /*position:relative;*/
        /*top: 100px;*/
        padding: 0px;
        width: 990px;
        height: 725px;
        margin: 3em auto 1em;
      }
      .tabs { float: right; }
      .tabs a{
                cursor: pointer;
                padding: 5px;
                background: #fff;
                color: #000;
                border: 1px solid #666;
                border-bottom: 0;
            }
            .tabs a:hover, .tabs a.active{
                background: #666;
                color: #fff;
            }

            .tabContent{
                border: 1px solid #aaa;
                margin: 1.4em 0;
                padding: 5px;
            }
      /* Tip (for globe and bar user tips) */
      .tip {
        font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
        font-size: 9pt;
        text-align: right;
        color: #999;
        }

      /* Country Bar Chart */
      .bar_rect {
          fill-opacity: .9;
          stroke-width: .5;
          stroke: #bdbdbd;
          }

      .bar_text {
          text-anchor: end;
           font-size: 9px;
          }

      .bar_title {
          text-anchor: middle;
          font-size: 16px;
          font-weight: bold;
        }

       /* styles specific to scroll-pane */
        .scroll-pane
        {
            width: 100%;
            height: 650px;
            overflow: auto;
        }

</style>
	
	<?php include 'includes/header.html'; ?>

  <div id="overview_content" class="cf">
	<div class="tabs cf">
      <a data-toggle="tab_1_globe">Globe</a>
      <a data-toggle="tab_2_bar">Bar Chart</a>
  </div>

  <div class="tabContent">
  <!-- Overview Vis and Legend -->
      <div id="tab_1_globe">
          <div class="tip">click to manually rotate, double-click auto-rotate.</div>
        	<section id="overviewVis"></section>
        	<section id="legend_globe" class="legend"></section>
      </div>

      <div id="tab_2_bar">
          <section id="country_bar_controls">
             <label class="tip">sort by </label>
             <label class="tip"><input type="radio" name="order" value="country">country</label>
             <label class="tip"><input type="radio" name="order" value="result" checked>result</label>
          </section>
          <section id="country_bar_chart" class="scroll-pane"></section>
      </div>
  </div>
  </div>

<script>
$(function() {
  $(".tabs a").html5jTabs();
});
</script>
<!-- footer -->
	<?php include 'includes/footer.html'; ?>
	<script src="overview.js"></script>
</body>
</html>