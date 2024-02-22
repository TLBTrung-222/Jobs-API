// all request object will have 'user' property
// req.user = {userId, userName}
const { StatusCodes } = require("http-status-codes");
const Jobs = require("../models/Job");
const { BadRequestError } = require("../errors");

const getAllJobs = async (req, res) => {
    const jobs = await Jobs.find({ createdBy: req.user._id }).sort("createdAt"); // only find jobs associated with this user
    res.status(StatusCodes.OK).json({
        user: { name: req.user.name, email: req.user.email },
        jobs,
    });
};

const getJob = async (req, res) => {
    // nested destructuring
    const {
        user: { _id: userID },
        params: { id: jobID },
    } = req;
    const job = await Jobs.findOne({
        createdBy: userID, // user can only get the job they have
        _id: jobID,
    });
    if (!job) {
        throw new BadRequestError(`No job with id: ${jobID}`);
    }
    res.status(StatusCodes.OK).json({
        user: { name: req.user.name, email: req.user.email },
        job,
    });
};

const createJob = async (req, res) => {
    req.body.createdBy = req.user._id;
    const createdJob = await Jobs.create(req.body);
    res.status(StatusCodes.CREATED).json({
        user: { name: req.user.name, email: req.user.email },
        createdJob,
    });
};

const updateJob = async (req, res) => {
    const {
        user: { _id: userID },
        params: { id: jobID },
    } = req;

    const updatedJob = await Jobs.findOneAndUpdate(
        {
            createdBy: userID,
            _id: jobID,
        },
        req.body,
        { new: true, runValidators: true }
    );
    if (!updatedJob) {
        throw new BadRequestError(`No job with id: ${jobID}`);
    }

    res.status(StatusCodes.OK).json({
        user: { name: req.user.name, email: req.user.email },
        updatedJob,
    });
};
const deleteJob = async (req, res) => {
    const {
        user: { _id: userID },
        params: { id: jobID },
    } = req;

    const job = await Jobs.findOneAndDelete({ _id: jobID, createdBy: userID });

    if (!job) {
        throw new BadRequestError(`No job with id: ${jobID}`);
    }
    res.status(StatusCodes.OK).send();
};

module.exports = {
    getAllJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob,
};
