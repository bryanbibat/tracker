$(function(){
  var IPInfo = Backbone.Model.extend({});
  var IPInfoList = Backbone.Collection.extend({
    model: IPInfo,
    localStorage: new Store("tracker.backbone"),
    comparator: function(info) {
      if (info.get('requested_at') === undefined) {
        info.set({'requested_at': new Date(0).toString()});
      }
      return Date.parse(info.get('requested_at'));
    }
  });
  var IPInfos = new IPInfoList;

  var IPInfoView = Backbone.View.extend({
    tagName: "div",
    template: _.template($('#ip-info-template').html()),
    events: { 
      "click": "scrollUpdateMap",
      "mouseover": "highlight",
      "mouseout": "unhighlight"
    },

    initialize: function() {
      this.model.bind('change', this.render, this);
    },
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.$el.addClass("row past-search")
      this.updateMap();
      return this;
    },
    scrollUpdateMap: function() {
      $("html, body").animate({"scrollTop": $("#tracer-app").position().top - 10});
      this.updateMap();
    },
    updateMap: function() {
      this.options.gmap.panTo(new google.maps.LatLng(this.model.get("geoplugin_latitude"),this.model.get("geoplugin_longitude")));
      this.options.gmap.setZoom(6);
    },
    highlight: function() {
      this.$el.addClass("highlight");
    },
    unhighlight: function() {
      this.$el.removeClass("highlight");
    }

  });

  var AppView = Backbone.View.extend({
    el: $("#tracer-app"),
    events: { "keypress #new-ip": "findOnEnter" },
    initialize: function() {
      this.input = this.$("#new-ip");
      IPInfos.bind('add', this.searchNew, this);
      IPInfos.bind('reset', this.addAll, this);
      var myOptions = {
          zoom: 1,
          center: new google.maps.LatLng(14.58, 121),
          mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      this.gmap = new google.maps.Map(document.getElementById("map"), myOptions);
      IPInfos.fetch();
    },

    findOnEnter: function(e) {
      if (e.keyCode != 13) return;
      if (!this.input.val()) return;
      var gpUrl = "http://www.geoplugin.net/json.gp?jsoncallback=?";
      var data = { "ip": $.trim(this.input.val()) }
      $.getJSON(gpUrl, data, function(geodata) {
        geodata.requested_at = new Date;
        IPInfos.create(geodata);
      });
      this.input.val('');
    },

    searchNew: function(ipInfo) {
      var view = new IPInfoView({ model: ipInfo, gmap: this.gmap });
      this.$("#results").prepend(view.render().el);
    },

    addAll: function() {
      IPInfos.each(this.searchNew, this);
    }

  });

  var App = new AppView;
});
