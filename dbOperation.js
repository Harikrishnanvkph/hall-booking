const { error } = require("node:console");
const client = require("./server");
const expRoute = require("express").Router();
const fs = require("node:fs/promises");


async function readHTML(){
  const data = await fs.readFile("./body.html","utf-8",(error,data)=>{
    if(error){
      console.log(error);
    }else{
      return data;
    }
  })
  return data;
}

// get GUIDELINES OF USING THE API Application
expRoute.get("/", async (req, res, next) => {
  res.writeHead(200,{"Content-Type" : "text/html"});
  const lg = await readHTML();
  res.write(lg);
  res.end();
});


// get all rooms
expRoute.get("/room", async (req, res, next) => {
  const rooms = await client
    .db("Room_Booking")
    .collection("Rooms")
    .find({})
    .toArray();
  console.log(rooms);
  res.json(rooms);
});



// create a room (QUESTION 1)
expRoute.post("/room/create", async (req, res, next) => {
  const bd = JSON(req.body);
  console.log(bd);
  await client.db("Room_Booking").collection("Rooms").insertOne(bd);
  res.json(bd);
});

// Delete a room
expRoute.delete("/room/delete/:id", async (req, res, next) => {
  const { id } = req.params;
  await client
    .db("Room_Booking")
    .collection("Rooms")
    .deleteOne({ room_id: id });
  res.json({
    action: "success",
  });
});

// Book a room (QUESTION 2)
expRoute.post("/room/book/:id", async (req, res, next) => {
  const { id } = req.params;
  const bd = req.body;
  let qBook = false;
  await client
    .db("Room_Booking")
    .collection("BookingData")
    .aggregate([
      { $match: { Room_id: id } },
      {
        $project: {
          _id: 0,
          Bookeddata: {
            $filter: {
              input: "$Bookeddata",
              as: "item",
              cond: { $eq: ["$$item.Date", bd.Date] },
            },
          },
        },
      },
    ])
    .forEach(function (doc) {
      doc.Bookeddata.forEach(function (it) {
        const st = parseInt(it.start_Time);
        const et = parseInt(it.end_Time);
        if (
          (parseInt(bd.start_Time) >= st && parseInt(bd.start_Time) <= et) ||
          (parseInt(bd.end_Time) >= st && parseInt(bd.end_Time) <= et)
        ) {
          qBook = true;
        }
      });
    });
  if (qBook) {
    res.send(
      "The Date and Time of booking the room is booked already. Try with different date"
    );
  } else {
    await client
      .db("Room_Booking")
      .collection("BookingData")
      .updateOne(
        { Room_id: id },
        {
          $push: {
            //generating booked id
            Bookeddata: {...req.body,"Booked_Id" : `${id}${bd.start_Time}${bd.end_Time}`},
          },
        }
    );
    const invoice = await client
    .db("Room_Booking")
    .collection("Rooms").find({room_id : id},{_id :0,pricePerHour : 1, amenities : 1}).toArray();
    res.json({
      action: "Success",
      invoice : `Booking done successfully...
      ***INVOICE*** => ${(parseInt(bd.end_Time) - parseInt(bd.start_Time)+1)} * ${invoice[0].pricePerHour} = ₹${(parseInt(bd.end_Time) - parseInt(bd.start_Time)+1) * parseInt(invoice[0].pricePerHour.split("₹")[1])}`
    });
  }
});


// get booking data for each room (QUESTION 3)
expRoute.get("/room/bookingstatus",async (req,res,next)=>{
  const booking = await client.db("Room_Booking").collection("BookingData")
  .find({}).toArray();
  res.json(booking);
})


// all customers with booked data (QUESTION 4)
expRoute.get("/room/customerdata",async (req,res,next)=>{
  let customers = [];
  const booking = await client.db("Room_Booking").collection("BookingData")
  .find({}).forEach(function(doc){
    const room_id = doc.Room_id;
    doc.Bookeddata.forEach(function(it){
      customers.push({...it,"Room_id" : room_id});
    })
  });
  res.json(customers);
})


// all customers with booked data (QUESTION 5)
expRoute.get("/room/customerbookcount",async (req,res,next)=>{
  const booking = await client.db("Room_Booking").collection("BookingData")
  .aggregate([
    {
      $unwind: "$Bookeddata"
    },
    {
      $group: {
        _id: {
          customerName: "$Bookeddata.customerName",
          Room_id: "$Room_id",
          Date: "$Bookeddata.Date",
          start_Time: "$Bookeddata.start_Time",
          end_Time: "$Bookeddata.end_Time",
          Booked_Id: "$Bookeddata.Booked_Id"
        },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        count: 1,
        customerName: "$_id.customerName",
        Room_id: "$_id.Room_id",
        Date: "$_id.Date",
        start_Time: "$_id.start_Time",
        end_Time: "$_id.end_Time",
        Booked_Id: "$_id.Booked_Id",
        _id: 0
      }
    }
  ]).toArray();
  res.json(booking);
})



module.exports = expRoute;
