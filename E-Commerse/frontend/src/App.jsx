import { useEffect, useState } from "react";

function App() {

  const [product, setproduct] = useState([]);

  useEffect(() => {

    fetch('http://127.0.0.1:8000/api/products/')
      .then(response => response.json())
      .then(data => setproduct(data))
      .catch(error => console.log(error));

  }, []);

  return (

    <div className="min-h-screen bg-gray-100 text-gray-800 ">

      <h1 className="text-3xl font-bold underline mb-4">
        Product List
      </h1>

      {
        product.map(product => (

          <div
            key={product.id}
            className="bg-white p-4 rounded shadow mb-4 mx-10"
          >

            <h2 className="text-xl font-semibold">
              {product.name}
            </h2>

            <p className="text-gray-600">
              {product.description}
            </p>

            <p className="text-green-600 font-bold">
              ₹ {product.price}
            </p>

          </div>

        ))
      }

    </div>

  );
}

export default App;