import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Allocation, ClassGroup, SchoolConfig, Subject, Teacher, GeneratedSchedule } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the response schema for strict JSON output
const scheduleSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    slots: {
      type: Type.ARRAY,
      description: "List of all scheduled slots for the entire school.",
      items: {
        type: Type.OBJECT,
        properties: {
          classId: { type: Type.STRING, description: "The ID of the class" },
          teacherId: { type: Type.STRING, description: "The ID of the teacher" },
          subjectId: { type: Type.STRING, description: "The ID of the subject" },
          dayIndex: { type: Type.INTEGER, description: "0 for Monday, 1 for Tuesday, etc." },
          periodIndex: { type: Type.INTEGER, description: "0-indexed period number in the day" },
        },
        required: ["classId", "teacherId", "subjectId", "dayIndex", "periodIndex"],
      },
    },
  },
  required: ["slots"],
};

export const generateSchedule = async (
  config: SchoolConfig,
  subjects: Subject[],
  teachers: Teacher[],
  classes: ClassGroup[],
  allocations: Allocation[]
): Promise<GeneratedSchedule> => {
  
  // Construct a prompt that describes the constraints
  const prompt = `
    You are an expert school timetable scheduler. Your task is to generate a conflict-free schedule based on the provided data.

    Constraints & Rules:
    1. A Teacher cannot be in two classes at the same time (same day, same period).
    2. A Class cannot have two teachers at the same time.
    3. You must try to fulfill the 'periodsPerWeek' for each allocation.
    4. The school has ${config.daysPerWeek} days per week.
    5. The school has ${config.periodsPerDay} periods per day.
    6. Break is after period ${config.breakAfterPeriod} (This is for visualization, just ensure periods 0 to ${config.periodsPerDay - 1} are used).
    7. Distribute subjects evenly across the week if possible.

    Data:
    Classes: ${JSON.stringify(classes.map(c => ({ id: c.id, name: c.name })))}
    Teachers: ${JSON.stringify(teachers.map(t => ({ id: t.id, name: t.name })))}
    Allocations (Workload): ${JSON.stringify(allocations.map(a => ({
      classId: a.classId,
      teacherId: a.teacherId,
      subjectId: a.subjectId,
      count: a.periodsPerWeek
    })))}

    Return a JSON object containing an array of 'slots'. Each slot represents one assigned period.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: scheduleSchema,
        temperature: 0.2, // Low temperature for more deterministic/logic-based results
        systemInstruction: "You are a precise algorithmic scheduler. Do not halllucinate IDs. Use only provided IDs.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text) as GeneratedSchedule;
    return data;
  } catch (error) {
    console.error("Error generating schedule:", error);
    throw error;
  }
};