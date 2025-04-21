import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const text = formData.get("text");
    const audio = formData.get("audio");

    // Log the received data
    console.log("Received text:", text);
    console.log("Received audio file:", audio?.name);

    // Here you would typically process the data
    // For example, save to database, process the audio, etc.

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Data received successfully",
    });
  } catch (error) {
    console.error("Error processing submission:", error);
    return NextResponse.json({ success: false, message: "Failed to process submission" }, { status: 500 });
  }
}
