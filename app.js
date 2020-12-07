const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
require('dotenv').config();
const app = express();
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static(`${__dirname}/public`))


// Mongoose
mongoose.connect(`mongodb+srv://davidayankoya:ajuwasegun23@cluster0.2napv.mongodb.net/todoListDB?retryWrites=true&w=majority`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Each Item
const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
})
const Item = mongoose.model('Item', itemSchema);

let defaultArr = [{
    name: 'Welcome to your ToDo List'
  },
  {
    name: 'Hit the + button to add a new item'
  },
  {
    name: 'Hit this button to delete an item -->'
  }
];

// Each List
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});
const List = mongoose.model('List', listSchema);



// Render Pages
app.get('/', (req, res) => {

  Item.find((error, result) => {

    if (result.length === 0) {
      res.render('list', {
        listTitle: 'Today',
        listItems: defaultArr
      });
      console.log('Loaded default items!');
    } else {
      if(error) {
        console.log(error)
      } else {
        res.render('list', {
          listTitle: 'Today',
          listItems: result
        })
      }
    }

  })

})


// Add Items
app.post("/", (req, res) => {
  let itemName = req.body.newItem;
  let listName = req.body.list

  let item = new Item({
    name: itemName
  });

  if(listName === 'Today'){
    item.save();
    res.redirect('/');
  } else {
    List.findOne({name: listName}, (error, result) => {
        result.items.push(item)
        result.save();
        res.redirect(`/${listName}`);
    })
  }

})


// Remove Items
app.post('/remove', (req, res) => {
  let itemId = req.body.removeItem;
  let listName = req.body.listName;

  if(listName === 'Today'){
    Item.findByIdAndRemove({_id: itemId}, (error) => {
      if(error){
        console.log(error)
      } else {
        console.log('Deleted an item!');
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      {name: listName}, {$pull: {items: {_id: itemId} }}, (error, result) => {
         if(!error){
          res.redirect(`/${listName}`)
         }
       })
  }


});


// Favicon exception
app.get('/favicon.ico', (req, res)=>{
  return 'your favicon'
 })
 


// Custom Lists
app.get('/:customListName', (req, res) => {
  let customListName = _.capitalize(req.params.customListName);
  
  List.findOne({name: customListName}, (error, result) => {
    if(!result){
      let list = new List({
        name: customListName,
        items: []
      });
      list.save();
      res.redirect(`/${customListName}`)
      console.log('Doesnt exist, making new List')
    } else {
      res.render('list', {
        listTitle: result.name,
        listItems: result.items
      });
      console.log('Found It!')
    }
  });

  console.log(req.params.customListName);
})



// Start Server
app.listen(port, () => console.log(`Server has started!`));