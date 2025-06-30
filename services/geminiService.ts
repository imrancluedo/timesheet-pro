import { GoogleGenAI } from "@google/genai";
import { TimesheetEntry } from '../types';

export const generateTimesheetSummary = async (entries: TimesheetEntry[]): Promise<string> => {
    if (!process.env.API_KEY) {
        console.warn("API_KEY environment variable not set. Using mock response.");
        return new Promise(resolve => setTimeout(() => resolve("This is a mock AI summary. The contractor focused on building the main dashboard components and setting up the timesheet submission logic."), 1000));
    }
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const entriesText = entries
            .filter(e => e.hours > 0 && (e.taskName.trim() !== '' || e.taskDescription.trim() !== ''))
            .map(e => `- ${e.date} (${e.hours}h): ${e.taskName}${e.taskDescription ? ` - ${e.taskDescription}` : ''}`)
            .join('\n');
        
        if (!entriesText) {
            return "No work details were provided for this period.";
        }

        const prompt = `
            As a project manager, review the following timesheet entries for a software developer.
            Each entry includes a task name and, optionally, a more detailed description.
            Provide a concise, professional summary (2-3 sentences) of the work completed.
            Focus on key achievements and areas of work. Do not greet or sign off.

            Timesheet Entries:
            ${entriesText}
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error generating summary with Gemini API:", error);
        return "Error: Could not generate summary. Please check the console for details.";
    }
};
