$(function(){


  var Sentence = Backbone.Model.extend({

    defaults: function() {
      return {
        author: null,
        text: null,
      };
    },
    formattedSentence: function () {
      var newText = this.get("text");
      if(!newText) return ;
      if(['.','!','?',','].indexOf(newText.substr(-1)) == -1){
          newText += '.';
      }
      newText += ' ';
      newText = newText.substr(0,1).toUpperCase() + newText.substr(1);
      return newText
    },
    for_template: function() {
      var j = this.toJSON();
      j.formattedSentence = this.formattedSentence();
      return j;
    },
    valid : function()
    {
      if(this.get('text') && this.get('author')) return true
      return false;
    }
  });

  var SentencesCollection = Backbone.Firebase.Collection.extend({
    model: Sentence,
    firebase: new Firebase("https://burning-fire-5298.firebaseio.com")
  });

  Sentences = new SentencesCollection;

  SentenceView = Backbone.View.extend({

    template: _.template($('#tpl-sentence').html()),

    initialize : function(){
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'remove', this.remove);
    },
    render : function(){
      if(this.model){
        $('.story pre').append(this.template(this.model.for_template()));
        return this;
      }
    }
  })

  var AppView = Backbone.View.extend({

    el: $("#app"),

    events: {
      "submit #new-sentence":  "createOnEnter"
    },

    initialize: function() {
      this.listenTo(Sentences, 'add', this.addOne);
      this.listenTo(Sentences, 'reset', this.addAll)
      this.listenTo(Sentences, 'all', this.render);

      this.sentenceTextInput = $('#sentence-text');
      this.sentenceAuthorInput = $('#sentence-author');
    },

    addOne: function(sentence) {
      if(sentence.valid()){
        var view = new SentenceView({model: sentence});
        view.render();
      }
    },

    addAll: function() {
      Sentences.each(this.addOne, this);
    },

    createOnEnter: function(e) {
      e.preventDefault();
      if(this.sentenceTextInput.val().trim().length > 10){
        Sentences.add({text: this.sentenceTextInput.val(), author: this.sentenceAuthorInput.val()});
        this.sentenceTextInput.val('');
      }else{
        alert('Please write a correct sentence');
      }
    }

  });

  var App = new AppView;  
});