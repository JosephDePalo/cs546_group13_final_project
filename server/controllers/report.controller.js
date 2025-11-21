// Imports
import Report from "../models/report.model.js";

// @desc     Create new report
// @access   Private

export const newReport = async (req, res) => {
    try {
        const {user_id, event_id, violation, description} = req.body;
        const report = await Report.create({
            user_id,
            event_id,
            violation,
            description
        });

        res.json(report);
    } catch (err) {
        console.error("New report error:", err.message);
        res.status(500).json({ message: "Internal server error." });
    }
};

// @desc     Get reports
// @access   Public

export const getReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ message: "Report not found." });
        }

        res.json(report);
    } catch (err) {
        console.error("Get report error:", err.message);
        res.status(500).json({ message: "Unable to fetch report." });
    }
};

// @desc     Get report
// @access   Public

export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (err) {
    console.error("Get all reports error:", err.message);
    res.status(500).json({ message: "Unable to fetch reports." });
  }
}


// @desc     Update report 
// @access   Private/Admin

export const updateReport = async (req, res) => {
    try {
        let new_report = req.body;

        delete new_report._id;
        delete new_report.disabled;
        delete new_report.disabled_at;
        delete new_report.disabled_by;

        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ message: "Report not found." });
        }

        const updatedReport = await Report.findByIdAndUpdate(req.params.id, new_report, {
            new: true,
        });

        if (!updatedReport) {
            return res.status(404).json({ message: "Report not found." });
        }

        res.json(updatedReport);
    } catch (err) {
        console.error("Update report error:", err.message);
        res.status(500).json({ message: "Unable to update report." });
    }
}

// @desc     Delete report 
// @access   Private/Admin

export const deleteReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ message: "Event not found." });
        } else if (!req.user.is_admin){
            return res.status(403).json({ message: "Only admins can delete reports!"})
        }

        await report.deleteOne();

        res.json(report);
    } catch (err) {
        console.error("Delete report error:", err.message);
        res.status(500).json({ message: "Unable to delete report" });
    } 
}