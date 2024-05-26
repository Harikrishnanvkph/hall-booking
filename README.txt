PLEASE MAKE SURE YOU FOLLOW THE GUIDELINES TO USE THE API
by HARI KRISHNAN V K
ENDPOINTS:
/ - To Show API Guidlines [http request type : GET]

/room - To Get all rooms [http request type : GET]

/room/create - To Create a room (QUESTION 1) [http request type : POST]

/room/delete/:id - To Delete a room [http request type : DELETE]

/room/book/:id - To Book a room (QUESTION 2) [http request type : POST]

/room/bookingstatus - To Get booking data for each room (QUESTION 3) [http request type : GET]

/room/customerdata - To Get All customers with booked data (QUESTION 4) [http request type : GET]

/room/customerbookcount - To Get All customers with booked data (QUESTION 5) [http request type : GET]

To POST data for booking a room follow below template
date should of format = dd/mm/yyyy start_Time and end_Time should of format = 1 to 24 (considering 24 hours of day) Booked_Id = should be of nomenclature of string with structure as Room_id + start_Time+ end_Time (do not add these these are all should be concatenated as string)