const axios = require("axios");
const fs = require("fs");

async function testFetch() {
  try {
    const res = await axios.get("http://localhost:4000/api/cars");
    const cars = res.data?.data || res.data?.cars || res.data;
    if (cars && cars.length > 0) {
      const car = cars[0];
      const carId = car._id || car.id;

      const singleRes = await axios.get(
        "http://localhost:4000/api/cars/" + carId,
      );
      const singleCar =
        singleRes.data?.data || singleRes.data?.car || singleRes.data;
      fs.writeFileSync("car_dump.json", JSON.stringify(singleCar, null, 2));
      console.log("Written to car_dump.json");
    }
  } catch (err) {
    console.error(err);
  }
}
testFetch();
