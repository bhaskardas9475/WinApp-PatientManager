import { Button } from "@/components";
import { Text, View } from "react-native";
import { getPrinters, printPrescriptionToPrinter } from "@/utils/printer.utils";

const CreatePrescription = () => {
  const handleCreatePrescription = async () => {
    await printPrescriptionToPrinter(
      {
        title: "City Care Clinic",
        headerLines: ["21 Lake Road, Kolkata", "Phone: +91 90000 00000"],
        prescriptionTitle: "Prescription",
        prescriptionDate: "2026-05-03",
        patientDetails: [
          { label: "Patient Name", value: "John Doe" },
          { label: "Age", value: 42 },
          { label: "Gender", value: "Male" },
        ],
        medicines: [
          {
            medicine: "Paracetamol 650",
            dosage: "1 tablet",
            timing: "Morning/Night Morning/Night Morning/Night",
            duration: "5 days",
          },
          {
            medicine: "Vitamin C Vitamin C Vitamin C Vitamin CVitamin C",
            dosage: "1 tablet",
            timing: "After lunch",
            duration: "10 days",
          },
        ],
        tests: [
          {
            test: "CBC",
            instructions: "Fasting not required",
            remarks: "This week",
          },
        ],
        notes: ["Avoid cold drinks", "Take medicines after food"],
        advice: ["Drink plenty of water", "Follow up after 5 days"],
        footerLines: ["Dr. Sharma", "Get well soon"],
      },
      "OneNote for Windows 10",
    );
  };
  const handleGetPrinters = async () => {
    console.log(await getPrinters());
  };
  return (
    <View>
      <Text>Create Prescription</Text>
      <Button title="Get Printers" onPress={handleGetPrinters} />
      <Button title="Create Prescription" onPress={handleCreatePrescription} />
    </View>
  );
};
export default CreatePrescription;
