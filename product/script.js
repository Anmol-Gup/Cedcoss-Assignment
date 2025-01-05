const url = "http://127.0.0.1:3000/api/products";
// {
//     "properties": {
//       "name": "Implementation Service",
//       "price": "6000.00",
//       "hs_sku": "123456",
//       "description": "Onboarding service for data product",
//       "hs_cost_of_goods_sold": "600.00",
//       "hs_recurring_billing_period": "P12M"
//     }
//   }

const createProduct = async () => {
  const name = document.getElementById("name");
  const price = document.getElementById("price");
  const hs_sku = document.getElementById("hs_sku");
  const description = document.getElementById("description");
  const hs_cost_of_goods_sold = document.getElementById(
    "hs_cost_of_goods_sold"
  );
  const hs_recurring_billing_period = document.getElementById(
    "hs_recurring_billing_period"
  );

  const requestBody = {
    name: name.value,
    price: price.value,
    hs_sku: hs_sku.value,
    description: description.value,
    hs_cost_of_goods_sold: hs_cost_of_goods_sold.value,
    hs_recurring_billing_period: hs_recurring_billing_period.value,
  };

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ properties: requestBody }), // Include requestBody if data is being sent
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.log(error.message);
  }
};

document.querySelector("button").addEventListener("click", () => {
  createProduct();
});

const showProduct = () => {
  fetch(url)
    .then((response) => response.json())
    .then((data) => console.log(data));
};

// window.onload = () => {
//   showProduct();
// };

const sendFile = async (event) => {
  event.preventDefault();
  const fileInput = document.getElementById("uploaded_file");
  const file = fileInput.files[0];
  const formData = new FormData();
  console.log(file)
  formData.append("file", file);

  const options = {
    method: "POST",
    body: formData,
  };

  try {
    
    const response = await fetch("http://127.0.0.1:3000/api/file", options);
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.log(error.message);
  }
};

const form = document.getElementById("form");
form.addEventListener('submit', sendFile)

