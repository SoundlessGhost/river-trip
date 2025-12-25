// import NadiYatraForm2 from "../components/NadiYatraForm2";

// import NadiYatraForm2 from "@/components/NadiYatraForm2";
import PaymentForm from "@/components/PaymentForm";

// export default function Home() {
//   return (
//     <>
//       <NadiYatraForm2 />
//     </>
//   );
// }

// import PaymentForm from "@/components/PaymentForm";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        shurjoPay Integration
      </h1>
      <PaymentForm />
      {/* <NadiYatraForm2 /> */}
    </main>
  );
}
