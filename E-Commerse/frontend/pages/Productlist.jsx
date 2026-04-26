import { useEffect,useState } from "react";
import Productcard from "../Components/productcard.jsx";
function Productlist(){
    const[product,setproducts]=useState([]);
    const[loading,setloading]=useState(true);
    const[error,setError]=useState(null)
    const BASEURL=import.meta.env.VITE_DJANGO_BASE_URL
    useEffect (()=>{
        fetch(`${BASEURL}/api/product/`)
        .then((response)=>{
            if(!response.ok){
                throw new Error("Faild to fetch Products");                
            }
            return response.json()
        })
        .then((data)=>{
            setproducts(data);
            setloading(false)
        })
        .catch((error)=>{
            setError(error.message);
            setloading(false)
        })
    },[]);
    if(error){
        return <div>Error : {error}</div>
    }
    return (
        <div className="min-h-screen bg-gray-100">
            <h1 className="text-3xl font-bold text-center py-6 bg-white shadow-md">Product list</h1>
            <div className="grid grid-cols-1 sm:grid-cols2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
                {
                product.length > 0 ?(
                    product.map((product)=>(
                        <Productcard key={product.id} product={product} />
                    ))
                ):(
                    <p className="text-center col-span-full">No products Available</p>
                )
            }
            </div>

        </div>
    )
}
export default Productlist