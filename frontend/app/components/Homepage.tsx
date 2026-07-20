import Left from "./Left"
import Middle from "./Middle"
import Right from "./Right"

const Homepage = () => {

    return (
        <main className='w-full sm:grid grid-cols-[20%_50%_30%] h-screen'>



      <Left/>
      <Middle />
      <Right/>

        </main>
    )
}

export default Homepage
