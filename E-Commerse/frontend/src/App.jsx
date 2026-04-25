import {useEffect,useState} from 'react'
function App(){
const[products,setproducts]=useState([]);
useEffect(()=>{
    fetch('http://127.0.0.1:8000/api/product/')
    .then(response=>response.json())
    .then(data=>setproducts(data))
    .catch(error=>console.log('Error fetching message: ',error)  
    )
},[]) 
return(
    <div className='min-h-screen bg-gray-100 test-gray-800'>
        <h1 className='text-3xl font-bold underline'>Product List</h1>
        <div className='container max-auto p-4'>
            {
                products.map(products=>(
                    <div key={products.id} className='bg-white p-4 rounded shadow mb-4'>
                        <h2 className='text-xl font-semibold'>{products.name}</h2>
                        <p  className='text-gray-600'>{products.description}</p>
                        <p  className='text-gray-800'>${products.price}</p>


                    </div>
                ))
            }
        </div>

    </div>
)
}
export default App