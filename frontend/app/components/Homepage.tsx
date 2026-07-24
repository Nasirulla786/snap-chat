import Left from "./Left"
import Middle from "./Middle"
import Right from "./Right"

const Homepage = () => {

    return (
        <main className='w-full sm:grid md:grid-cols-[25%_50%_25%]  h-screen bg-black'>



      <Left/>
      <Middle />
      <Right/>

        </main>
    )
}

export default Homepage
