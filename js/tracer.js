$(function(){
  var IPInfo = Backbone.Model.extend({});
  var IPInfoList = Backbone.Collection.extend({
    model: IPInfo,
    localStorage: new Store("tracker.backbone")
  });
  var IPInfos = new IPInfoList;

  var IPInfoView = Backbone.View.extend({
    tagName: "div",
    template: _.template($('#ip-info-template').html()),

    initialize: function() {
      this.model.bind('change', this.render, this);
    },
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
  });

  var AppView = Backbone.View.extend({
    el: $("#tracer-app"),
    events: { "keypress #new-ip": "findOnEnter" },
    initialize: function() {
      this.input = this.$("#new-ip");
      IPInfos.bind('add', this.searchNew, this);
      IPInfos.bind('reset', this.addAll, this);
      IPInfos.fetch();
      console.log(IPInfos);
    },

    findOnEnter: function(e) {
      if (e.keyCode != 13) return;
      if (!this.input.val()) return;
      var gpUrl = "http://www.geoplugin.net/json.gp?jsoncallback=?";
      var data = { "ip": this.input.val()}
      $.getJSON(gpUrl, data, function(geodata) {
        IPInfos.create(geodata);
      });
      this.input.val('');
    },

    searchNew: function(ipInfo) {
      var view = new IPInfoView({ model: ipInfo });
      this.$("#results").append(view.render().el);
    },

    addAll: function() {
      IPInfos.each(this.searchNew);
    }

  });

  var App = new AppView;
});
