// Imports
import Report from "../models/report.model.js";

// @desc     Create new report
// @access   Private

export const newReport = async (req, res) => {
    try {
        const {reporter_id, target_type, target_id, reason, description, severity} = req.body;
        let current_date = new Date();
        const report = await Report.create({
            reporter_id,
            target_type,
            target_id,
            reason,
            description, 
            severity
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

        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ message: "Report not found." });
        } else if (!req.user.is_admin) {
            return res.status(403).json({ message: "User does not have permissions to edit this report." });
        }

        const updatedReport = await Report.findByIdAndUpdate(req.params.id, new_report, {
            new: true,
        });

        if (!updatedReport) {
            return res.status(404).json({ message: "Report not found." });
        }
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
            return res.status(404).json({ message: "Report not found." });
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

// @desc     resolve the report once evaluated by an admin 
// @access   Private/Admin

export const resolveReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ message: "Report not found." });
        } else if (!req.user.is_admin){
            return res.status(403).json({ message: "Only admins can delete reports!"})
        }

        const {resolution_status, responding_admin_id, responding_admin_notes, resolution_decision} = req.body;
        let current_date = new Date();

        const resolvedReport = await Report.findByIdAndUpdate(req.params.id, {resolution_status: resolution_status, 
            responding_admin_id: responding_admin_id,
            responding_admin_notes: responding_admin_notes,
            resolution_decision: resolution_decision,
            resolved_at: current_date}, {
            new: true,
        });

        if (!resolvedReport) {
            return res.status(404).json({ message: "Report not found." });
        }

        res.json(resolvedReport);

    } catch (err) {
        console.error("Resolve report error:", err.message);
        res.status(500).json({ message: "Unable to resolve report" });
    }
}

