import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Contract, ContractDocument } from './models/contract.schema';
import { Document, DocumentDocument } from './models/document.schema';
import { Onboarding, OnboardingDocument } from './models/onboarding.schema';
import { Notification } from '../employee-subsystem/notification/models/notification.schema';
import { DocumentType } from './enums/document-type.enum';
import { OnboardingTaskStatus } from './enums/onboarding-task-status.enum';
import mongoose from 'mongoose';
import { UploadSignedContractDto } from './DTO/upload-signed-contract.dto';
import { UploadComplianceDocumentsDto } from './DTO/upload-compliance-documents.dto';
import { HrSignContractDto } from './DTO/hr-sign-contract.dto';
import { CreateOnboardingChecklistDto } from './DTO/create-onboarding-checklist.dto';
import { CreateOnboardingWithDefaultsDto } from './DTO/create-onboarding-with-defaults.dto';
import { CancelOnboardingDto } from './DTO/cancel-onboarding.dto';
import { GetOnboardingChecklistDto } from './DTO/get-onboarding-checklist.dto';
import { SendOnboardingReminderDto } from './DTO/send-onboarding-reminder.dto';
import { UpdateTaskStatusDto } from './DTO/update-task-status.dto';
import { CreateOfferDto } from './DTO/create-offer.dto';
import { AddOfferApproverDto } from './DTO/add-offer-approver.dto';
import { ApproveOfferDto } from './DTO/approve-offer.dto';
import { SendOfferDto } from './DTO/send-offer.dto';
import { CandidateRespondOfferDto } from './DTO/candidate-respond-offer.dto';
import { EmployeeService } from '../employee-subsystem/employee/employee.service';
//import { PayrollExecutionService } from '../payroll-execution/payroll-execution.service';
import { Offer, OfferDocument } from './models/offer.schema';
import { signingBonus, signingBonusDocument } from '../payroll/config_setup/models/signingBonus.schema';
import { payGrade, payGradeDocument } from '../payroll/config_setup/models/payGrades.schema';
import { OfferResponseStatus } from './enums/offer-response-status.enum';
import { OfferFinalStatus } from './enums/offer-final-status.enum';

@Injectable()
export class RecruitmentService {
    constructor(
        @InjectModel(Contract.name) private contractModel: mongoose.Model<ContractDocument>,
        @InjectModel(Document.name) private documentModel: mongoose.Model<DocumentDocument>,
        @InjectModel(Onboarding.name) private onboardingModel: mongoose.Model<OnboardingDocument>,
        @InjectModel(Notification.name) private notificationModel: mongoose.Model<Notification>,
        @InjectModel(Offer.name) private offerModel: mongoose.Model<OfferDocument>,
        @InjectModel(signingBonus.name) private signingBonusModel: mongoose.Model<signingBonusDocument>,
        @InjectModel(payGrade.name) private payGradeModel: mongoose.Model<payGradeDocument>,
        private readonly employeeService: EmployeeService,
        //private payrollExecutionService: PayrollExecutionService,
    ) { }

    // need guards for auth and roles
    //REC-018
    async createOffer(dto: CreateOfferDto) {
        const { applicationId, candidateId, hrEmployeeId, role, benefits, conditions, insurances, content, deadline } = dto;

        // Lookup signing bonus by role/position from payroll configuration
        const bonusConfig = await this.signingBonusModel.findOne({ 
            positionName: role, 
            status: 'approved' 
        });

        // Lookup gross salary by role/position from payroll configuration
        const salaryConfig = await this.payGradeModel.findOne({ 
            grade: role, 
            status: 'approved' 
        });

        const signingBonusAmount = bonusConfig ? bonusConfig.amount : 0;
        const grossSalaryAmount = salaryConfig ? salaryConfig.grossSalary :0;

        // Create the offer
        const offer = new this.offerModel({
            applicationId: new mongoose.Types.ObjectId(applicationId),
            candidateId: new mongoose.Types.ObjectId(candidateId),
            hrEmployeeId: new mongoose.Types.ObjectId(hrEmployeeId),
            grossSalary: grossSalaryAmount,
            signingBonus: signingBonusAmount,
            role,
            benefits,
            conditions,
            insurances,
            content,
            deadline: deadline ? new Date(deadline) : undefined,
            applicantResponse: OfferResponseStatus.PENDING,
            finalStatus: OfferFinalStatus.PENDING,
            approvers: [],
        });

        await offer.save();

        return {
            success: true,
            message: 'Offer created successfully',
            offerId: offer._id,
            offer,
            signingBonusApplied: signingBonusAmount > 0,
            signingBonusAmount,
            grossSalarySource: bonusConfig ? 'payroll_config' : 'manual_input',
        };
    }

    // need guards for auth and roles
    //REC-014
    async addOfferApprover(dto: AddOfferApproverDto) {
        const { offerId, employeeId, role } = dto;

        const offer = await this.offerModel.findById(offerId);
        if (!offer) {
            throw new NotFoundException('Offer not found');
        }

        // Check if approver already exists
        const existingApprover = offer.approvers.find(
            a => a.employeeId.toString() === employeeId
        );

        if (existingApprover) {
            throw new BadRequestException('This employee is already an approver for this offer');
        }

        // Add new approver with pending status
        offer.approvers.push({
            employeeId: new mongoose.Types.ObjectId(employeeId),
            role,
            status: 'pending',
            actionDate: null,
            comment: null,
        });

        await offer.save();

        return {
            success: true,
            message: 'Approver added successfully',
            offer,
        };
    }

    // need guards for auth and roles
    //REC-014
    async approveOffer(dto: ApproveOfferDto) {
        const { offerId, employeeId, status, comment } = dto;

        const offer = await this.offerModel.findById(offerId);
        if (!offer) {
            throw new NotFoundException('Offer not found');
        }

        // Find the approver in the list
        const approver = offer.approvers.find(
            a => a.employeeId.toString() === employeeId
        );

        if (!approver) {
            throw new NotFoundException('You are not an approver for this offer');
        }

        if (approver.status !== 'pending') {
            throw new BadRequestException(`You have already ${approver.status} this offer`);
        }

        // Update approver status
        approver.status = status;
        approver.actionDate = new Date();
        approver.comment = comment || null;

        // Check if all approvers have approved
        const allApproved = offer.approvers.every(a => a.status === 'approved');
        const anyRejected = offer.approvers.some(a => a.status === 'rejected');

        if (anyRejected) {
            offer.finalStatus = OfferFinalStatus.REJECTED;
        } else if (allApproved) {
            offer.finalStatus = OfferFinalStatus.APPROVED;
        }

        await offer.save();

        return {
            success: true,
            message: `Offer ${status} successfully`,
            offer,
            allApproved,
            finalStatus: offer.finalStatus,
        };
    }

    // need guards for auth and roles
    // REC-018
    async sendOffer(dto: SendOfferDto) {
        const { offerId } = dto;

        const offer = await this.offerModel.findById(offerId);
        if (!offer) {
            throw new NotFoundException('Offer not found');
        }

        // Check if all required approvals are obtained
        if (offer.approvers.length > 0) {
            const allApproved = offer.approvers.every(a => a.status === 'approved');
            if (!allApproved) {
                throw new BadRequestException('Cannot send offer until all approvers have approved');
            }
        }

        if (offer.finalStatus !== OfferFinalStatus.APPROVED && offer.approvers.length > 0) {
            throw new BadRequestException('Offer must be approved before sending');
        }

        // Mark offer as sent
        offer.finalStatus = 'sent' as any;
        await offer.save();

        // TODO: Send email/notification to candidate with offer letter
        const notification = new this.notificationModel({
            recipientId: [new mongoose.Types.ObjectId(offer.candidateId.toString())],
            type: 'Info',
            deliveryType: 'UNICAST',
            title: 'Job Offer Sent',
            message: `Your job offer for ${offer.role} has been sent. Please review and respond.`,
            relatedModule: 'Recruitment',
            isRead: false,
        });
        await notification.save();

        return {
            success: true,
            message: 'Offer sent to candidate successfully',
            offer,
        };
    }

    // need guards for auth and roles
    //REC-029
    async candidateRespondOffer(dto: CandidateRespondOfferDto) {
        const { offerId, candidateId, response, notes } = dto;

        const offer = await this.offerModel.findById(offerId);
        if (!offer) {
            throw new NotFoundException('Offer not found');
        }

        if (offer.candidateId.toString() !== candidateId) {
            throw new BadRequestException('This offer does not belong to you');
        }

        // Update candidate response
        offer.applicantResponse = response as any;

        if (response === 'accepted') {
            offer.finalStatus = 'accepted' as any;
            offer.candidateSignedAt = new Date();

            // Automatically create contract when offer is accepted
            const contract = new this.contractModel({
                offerId: offer._id,
                acceptanceDate: new Date(),
                grossSalary: offer.grossSalary,
                signingBonus: offer.signingBonus,
                role: offer.role,
                benefits: offer.benefits,
            });
            await contract.save();

            // Send notification
            const notification = new this.notificationModel({
                recipientId: [new mongoose.Types.ObjectId(offer.hrEmployeeId.toString())],
                type: 'Success',
                deliveryType: 'UNICAST',
                title: 'Offer Accepted',
                message: `Candidate has accepted the offer for ${offer.role}. Contract has been created. Please proceed with contract signing.`,
                relatedModule: 'Recruitment',
                isRead: false,
            });
            await notification.save();

        } else if (response === 'rejected') {
            offer.finalStatus = 'declined' as any;

            // Notify HR
            const notification = new this.notificationModel({
                recipientId: [new mongoose.Types.ObjectId(offer.hrEmployeeId.toString())],
                type: 'Warning',
                deliveryType: 'UNICAST',
                title: 'Offer Rejected',
                message: `Candidate has rejected the offer for ${offer.role}. ${notes || ''}`,
                relatedModule: 'Recruitment',
                isRead: false,
            });
            await notification.save();
        }

        await offer.save();

        return {
            success: true,
            message: `Offer ${response} successfully`,
            offer,
        };
    }

    // need guards for auth and roles
    async signContract(dto: UploadSignedContractDto, files: any[]) {
        const { contractId, candidateId, mainContractFileIndex, signedAt, documentTypes } = dto;

        const contract = await this.contractModel.findById(contractId);
        if (!contract) {
            throw new NotFoundException('Contract not found');
        }

        if (!files || files.length === 0) {
            // nothing to attach — simply update signedAt if provided
            contract.employeeSignedAt = signedAt ? new Date(signedAt) : new Date();
            await contract.save();
            return contract;
        }

        // determine which file is the main signed contract
        let mainIndex = typeof mainContractFileIndex === 'number' ? mainContractFileIndex : -1;
        if (mainIndex === -1) {
            mainIndex = files.findIndex(f => {
                const name = ((f as any).originalname || (f as any).filename || (f as any).path || '').toString().toLowerCase();
                return name.includes('contract');
            });
        }
        if (mainIndex === -1) mainIndex = 0; // fallback to first file

        // create Document entries for each uploaded file
        const createdDocs: DocumentDocument[] = [];
        for (let i = 0; i < files.length; i++) {
            const f = files[i];
            // use document type from frontend if provided, otherwise infer from mainContractFileIndex
            let docType: DocumentType;
            if (documentTypes && documentTypes[i]) {
                docType = documentTypes[i] as DocumentType;
            } else {
                docType = i === mainIndex ? DocumentType.CONTRACT : DocumentType.CERTIFICATE;
            }
            const doc = new this.documentModel({
                ownerId: candidateId ? new mongoose.Types.ObjectId(candidateId) : undefined,
                type: docType,
                filePath: (f as any).path || (f as any).filename || f.originalname,
                uploadedAt: new Date(),
            });
            await doc.save();
            createdDocs.push(doc);
        }

        // choose main document for contract (the one with CONTRACT type)
        let mainDoc: DocumentDocument | undefined;
        mainDoc = createdDocs.find(d => d.type === DocumentType.CONTRACT) || createdDocs[0];

        if (mainDoc) {
            contract.documentId = mainDoc._id;
            contract.employeeSignatureUrl = mainDoc.filePath;
        }

        contract.employeeSignedAt = signedAt ? new Date(signedAt) : new Date();

        await contract.save();

        return contract;
    }

    // need guards for auth and roles
    //ONB-001
    async hrSignContract(dto: HrSignContractDto) {
        const { contractId, hrEmployeeId, signedAt } = dto;

        const contract = await this.contractModel.findById(contractId);
        if (!contract) {
            throw new NotFoundException('Contract not found');
        }

        if (!contract.employeeSignedAt) {
            throw new BadRequestException('Employee must sign the contract first');
        }

        contract.employerSignedAt = signedAt ? new Date(signedAt) : new Date();
        // optionally store which HR employee signed
        if (hrEmployeeId) {
            contract.employerSignatureUrl = `hr-signed-by-${hrEmployeeId}`;
        }

        await contract.save();

        // Get candidateId from the offer for onboarding and bonus processing
        const populatedContract = await this.contractModel.findById(contractId).populate('offerId');
        const offer = populatedContract?.offerId as any;

        // Automatically trigger onboarding when BOTH employee and HR have signed
        if (offer?.candidateId) {
            // Create employee profile first
            const employeeData = {
                firstName: offer.candidateId.firstName || 'New',
                lastName: offer.candidateId.lastName || 'Employee',
                nationalId: offer.candidateId.nationalId || `TEMP-${Date.now()}`,
                employeeNumber: `EMP-${Date.now()}`,
                dateOfHire: new Date(),
                workEmail: offer.candidateId.email,
                status: 'PROBATION' as any,
                contractStartDate: new Date(),
                contractType: 'PERMANENT' as any,
                workType: 'FULL_TIME' as any,
            };

            const createdEmployee = await this.employeeService.onboard(employeeData);
            const employeeProfileId = String((createdEmployee as any)._id || (createdEmployee as any).id);

            const startDate = new Date();
            startDate.setDate(startDate.getDate() + 7); // Start date 7 days from now
            
            await this.createOnboardingWithDefaults({
                employeeId: employeeProfileId,
                startDate: startDate.toISOString(),
                includeITTasks: true,
                includeAdminTasks: true,
                includeHRTasks: true,
            });

            // Send notification to new employee with their employee details
            const welcomeNotification = new this.notificationModel({
                recipientId: [new mongoose.Types.ObjectId(employeeProfileId)],
                type: 'Success',
                deliveryType: 'UNICAST',
                title: 'Welcome to the Team!',
                message: `Congratulations! Your employee profile has been created. Your Employee ID: ${employeeData.employeeNumber}. Work Email: ${employeeData.workEmail || 'Will be assigned'}. Your start date is ${startDate.toDateString()}. Please check your onboarding checklist for tasks to complete.`,
                relatedModule: 'Recruitment',
                isRead: false,
            });
            await welcomeNotification.save();
        }

        // Automatically process signing bonus when BOTH employee and HR have signed
        // if (contract.signingBonus && contract.signingBonus > 0 && contract.role) {
        //     if (offer?.candidateId) {
        //         await this.payrollExecutionService.processSigningBonusByPosition(
        //             offer.candidateId.toString(),
        //             contract.role
        //         );
        //     }
        // }

        return contract;
    }

    // need guards for auth and roles
    //ONB-007
    async uploadComplianceDocuments(dto: UploadComplianceDocumentsDto, files: any[]) {
        const { employeeId, documentTypes } = dto;

        if (!files || files.length === 0) {
            throw new BadRequestException('No files provided');
        }

        if (documentTypes.length !== files.length) {
            throw new BadRequestException('Number of document types must match number of files');
        }

        // create Document entries for each uploaded file
        const createdDocs: DocumentDocument[] = [];
        for (let i = 0; i < files.length; i++) {
            const f = files[i];
            const docType = documentTypes[i] as DocumentType;

            const doc = new this.documentModel({
                ownerId: new mongoose.Types.ObjectId(employeeId),
                type: docType,
                filePath: (f as any).path || (f as any).filename || f.originalname,
                uploadedAt: new Date(),
            });
            await doc.save();
            createdDocs.push(doc);
        }

        // Automatically update onboarding tasks based on uploaded document types
        const onboarding = await this.onboardingModel.findOne({
            employeeId: new mongoose.Types.ObjectId(employeeId)
        });

        const updatedTasks: string[] = [];
        if (onboarding) {
            for (let i = 0; i < documentTypes.length; i++) {
                const docType = documentTypes[i];
                const doc = createdDocs[i];

                // Map document types to task names (customize based on your task naming)
                const taskNameMap: Record<string, string[]> = {
                    'id': ['Upload ID', 'Submit ID', 'Provide ID'],
                    'contract': ['Upload Contract', 'Submit Contract', 'Sign Contract'],
                    'certificate': ['Upload Certification', 'Submit Certifications', 'Provide Certificates'],
                };

                const possibleTaskNames = taskNameMap[docType.toLowerCase()] || [];

                // Find and update matching task
                for (const task of onboarding.tasks) {
                    const taskNameLower = task.name.toLowerCase();
                    const isMatch = possibleTaskNames.some(name => taskNameLower.includes(name.toLowerCase()));

                    if (isMatch && task.status !== OnboardingTaskStatus.COMPLETED) {
                        task.status = OnboardingTaskStatus.COMPLETED;
                        task.completedAt = new Date();
                        task.documentId = doc._id;
                        updatedTasks.push(task.name);
                        break; // Only update first matching task
                    }
                }
            }

            // Check if all tasks are completed
            const allCompleted = onboarding.tasks.every(t => t.status === OnboardingTaskStatus.COMPLETED);
            if (allCompleted) {
                onboarding.completed = true;
                onboarding.completedAt = new Date();
            }

            await onboarding.save();
        }

        return {
            success: true,
            message: 'Compliance documents uploaded successfully',
            documentIds: createdDocs.map(d => d._id),
            documents: createdDocs,
            updatedTasks: updatedTasks.length > 0 ? updatedTasks : undefined,
        };
    }

    // need guards for auth and roles
    //ONB-001
    async createOnboardingChecklist(dto: CreateOnboardingChecklistDto) {
        const { employeeId, tasks } = dto;

        // Transform tasks to include default status
        const formattedTasks = tasks.map(task => ({
            name: task.name,
            department: task.department,
            status: OnboardingTaskStatus.PENDING,
            deadline: task.deadline ? new Date(task.deadline) : undefined,
            notes: task.notes,
        }));

        // Check if onboarding already exists
        let onboarding = await this.onboardingModel.findOne({
            employeeId: new mongoose.Types.ObjectId(employeeId)
        });

        if (onboarding) {
            // Add new tasks to existing onboarding
            onboarding.tasks.push(...formattedTasks);
            await onboarding.save();

            return {
                success: true,
                message: 'Tasks added to existing onboarding checklist',
                onboardingId: onboarding._id,
                onboarding,
                tasksAdded: formattedTasks.length,
            };
        }

        // Create new onboarding if none exists
        onboarding = new this.onboardingModel({
            employeeId: new mongoose.Types.ObjectId(employeeId),
            tasks: formattedTasks,
            completed: false,
        });

        await onboarding.save();

        return {
            success: true,
            message: 'Onboarding checklist created successfully',
            onboardingId: onboarding._id,
            onboarding,
        };
    }

    // need guards for auth and roles
    //ONB-001
    //ONB-009
    //ONB-012
    //ONB-013
    async createOnboardingWithDefaults(dto: CreateOnboardingWithDefaultsDto) {
        const { employeeId, startDate, includeITTasks = true, includeAdminTasks = true, includeHRTasks = true } = dto;

        const deadline = startDate ? new Date(startDate) : new Date();
        const tasks: any[] = [];

        // IT Tasks
        if (includeITTasks) {
            tasks.push(
                {
                    name: 'Allocate Email Account',
                    department: 'IT',
                    status: OnboardingTaskStatus.PENDING,
                    deadline: deadline,
                    notes: 'Automated: Create corporate email account'
                },
                {
                    name: 'Assign Laptop',
                    department: 'IT',
                    status: OnboardingTaskStatus.PENDING,
                    deadline: deadline,
                    notes: 'Automated: Allocate and configure laptop'
                },
                {
                    name: 'Grant System Access',
                    department: 'IT',
                    status: OnboardingTaskStatus.PENDING,
                    deadline: deadline,
                    notes: 'Automated: Setup access to internal systems and applications'
                }
            );
        }

        // Admin Tasks
        if (includeAdminTasks) {
            tasks.push(
                {
                    name: 'Assign Workspace',
                    department: 'Admin',
                    status: OnboardingTaskStatus.PENDING,
                    deadline: deadline,
                    notes: 'Automated: Allocate desk/office space'
                },
                {
                    name: 'Issue ID Badge',
                    department: 'Admin',
                    status: OnboardingTaskStatus.PENDING,
                    deadline: deadline,
                    notes: 'Automated: Create and assign employee ID badge'
                }
            );
        }

        // HR Tasks
        if (includeHRTasks) {
            tasks.push(
                {
                    name: 'Setup Payroll',
                    department: 'HR',
                    status: OnboardingTaskStatus.PENDING,
                    deadline: deadline,
                    notes: 'Automated: Initialize payroll account (REQ-PY-23)'
                },
                {
                    name: 'Enroll in Benefits',
                    department: 'HR',
                    status: OnboardingTaskStatus.PENDING,
                    deadline: deadline,
                    notes: 'Automated: Setup health insurance and benefits'
                }
            );
        }

        // Check if onboarding already exists
        let onboarding = await this.onboardingModel.findOne({
            employeeId: new mongoose.Types.ObjectId(employeeId)
        });

        if (onboarding) {
            // Add new tasks to existing onboarding
            onboarding.tasks.push(...tasks);
            await onboarding.save();

            return {
                success: true,
                message: 'Default tasks added to existing onboarding checklist',
                onboardingId: onboarding._id,
                onboarding,
                taskSummary: {
                    itTasks: includeITTasks ? 3 : 0,
                    adminTasks: includeAdminTasks ? 2 : 0,
                    hrTasks: includeHRTasks ? 2 : 0,
                    tasksAdded: tasks.length,
                    totalTasks: onboarding.tasks.length,
                },
            };
        }

        // Create new onboarding if none exists
        onboarding = new this.onboardingModel({
            employeeId: new mongoose.Types.ObjectId(employeeId),
            tasks,
            completed: false,
        });

        await onboarding.save();

        return {
            success: true,
            message: 'Onboarding checklist created with default tasks',
            onboardingId: onboarding._id,
            onboarding,
            taskSummary: {
                itTasks: includeITTasks ? 3 : 0,
                adminTasks: includeAdminTasks ? 2 : 0,
                hrTasks: includeHRTasks ? 2 : 0,
                totalTasks: tasks.length,
            },
        };
    }

    // need guards for auth and roles
    //ONB-004
    async getOnboardingChecklist(dto: GetOnboardingChecklistDto) {
        const { employeeId } = dto;

        const onboarding = await this.onboardingModel.findOne({
            employeeId: new mongoose.Types.ObjectId(employeeId)
        }).populate('tasks.documentId');

        if (!onboarding) {
            throw new NotFoundException('No onboarding checklist found for this employee');
        }

        // Calculate progress statistics
        const totalTasks = onboarding.tasks.length;
        const completedTasks = onboarding.tasks.filter(t => t.status === OnboardingTaskStatus.COMPLETED).length;
        const inProgressTasks = onboarding.tasks.filter(t => t.status === OnboardingTaskStatus.IN_PROGRESS).length;
        const pendingTasks = onboarding.tasks.filter(t => t.status === OnboardingTaskStatus.PENDING).length;
        const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // Find next task to complete (first pending or in-progress task)
        const nextTask = onboarding.tasks.find(
            t => t.status === OnboardingTaskStatus.IN_PROGRESS || t.status === OnboardingTaskStatus.PENDING
        );

        return {
            success: true,
            onboarding,
            progress: {
                totalTasks,
                completedTasks,
                inProgressTasks,
                pendingTasks,
                progressPercentage,
            },
            nextTask: nextTask || null,
        };
    }

    // need guards for auth and roles
    //ONB-005
    async sendOnboardingReminders(dto: SendOnboardingReminderDto) {
        const { employeeId, daysBeforeDeadline = 1 } = dto;

        const onboarding = await this.onboardingModel.findOne({
            employeeId: new mongoose.Types.ObjectId(employeeId)
        });

        if (!onboarding) {
            throw new NotFoundException('No onboarding checklist found for this employee');
        }

        const now = new Date();
        const reminderThreshold = new Date();
        reminderThreshold.setDate(now.getDate() + daysBeforeDeadline);

        const notifications: Notification[] = [];

        // Find tasks that are not completed and have upcoming deadlines
        for (const task of onboarding.tasks) {
            if (task.status !== OnboardingTaskStatus.COMPLETED && task.deadline) {
                const taskDeadline = new Date(task.deadline);
                
                // Send reminder if deadline is within threshold and hasn't passed
                if (taskDeadline >= now && taskDeadline <= reminderThreshold) {
                    const daysUntilDeadline = Math.ceil((taskDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    
                    const notification = new this.notificationModel({
                        recipientId: [new mongoose.Types.ObjectId(employeeId)],
                        type: 'Warning',
                        deliveryType: 'UNICAST',
                        title: 'Onboarding Task Reminder',
                        message: `Reminder: Onboarding task "${task.name}" is due in ${daysUntilDeadline} day(s). Department: ${task.department || 'N/A'}`,
                        relatedModule: 'Recruitment',
                        isRead: false,
                    });
                    await notification.save();
                    notifications.push(notification);
                }
            }
        }

        return {
            success: true,
            message: `${notifications.length} reminder(s) sent`,
            notifications,
        };
    }

    // Call this method from a scheduled job/cron to check all employees
    //ONB-005
    async sendAllOnboardingReminders(daysBeforeDeadline: number = 1) {
        const onboardings = await this.onboardingModel.find({ completed: false });
        
        const results: any[] = [];
        for (const onboarding of onboardings) {
            try {
                const result = await this.sendOnboardingReminders({
                    employeeId: onboarding.employeeId.toString(),
                    daysBeforeDeadline,
                });
                results.push(result);
            } catch (error) {
                console.error(`Failed to send reminders for employee ${onboarding.employeeId}:`, error);
            }
        }

        return {
            success: true,
            totalProcessed: onboardings.length,
            results,
        };
    }

    // need guards for auth and roles
    //hepls with checklist
    async updateTaskStatus(dto: UpdateTaskStatusDto) {
        const { employeeId, taskName, status, documentId } = dto;

        const onboarding = await this.onboardingModel.findOne({
            employeeId: new mongoose.Types.ObjectId(employeeId)
        });

        if (!onboarding) {
            throw new NotFoundException('No onboarding checklist found for this employee');
        }

        const task = onboarding.tasks.find(t => t.name === taskName);
        if (!task) {
            throw new NotFoundException(`Task "${taskName}" not found in onboarding checklist`);
        }

        task.status = status as OnboardingTaskStatus;
        if (status === OnboardingTaskStatus.COMPLETED) {
            task.completedAt = new Date();
        }
        if (documentId) {
            task.documentId = new mongoose.Types.ObjectId(documentId);
        }

        // Check if all tasks are completed
        const allCompleted = onboarding.tasks.every(t => t.status === OnboardingTaskStatus.COMPLETED);
        if (allCompleted) {
            onboarding.completed = true;
            onboarding.completedAt = new Date();
        }

        await onboarding.save();

        return {
            success: true,
            message: `Task "${taskName}" updated to ${status}`,
            onboarding,
        };
    }

    // need guards for auth and roles
    async cancelOnboarding(dto: CancelOnboardingDto) {
        const { employeeId, reason, notes } = dto;

        const onboarding = await this.onboardingModel.findOne({
            employeeId: new mongoose.Types.ObjectId(employeeId)
        });

        if (!onboarding) {
            throw new NotFoundException('No onboarding checklist found for this employee');
        }

        if (onboarding.completed) {
            throw new BadRequestException('Cannot cancel completed onboarding');
        }

        onboarding.tasks.forEach(task => {
            if (task.status !== OnboardingTaskStatus.COMPLETED) {
                task.status = OnboardingTaskStatus.PENDING; // Or create a CANCELLED status
                task.notes = `Cancelled: ${reason}. ${task.notes || ''}`;
            }
        });

        onboarding.completed = true;
        onboarding.completedAt = new Date();

        await onboarding.save();

        const notification = new this.notificationModel({
            recipientId: [new mongoose.Types.ObjectId(employeeId)],
            type: 'Alert',
            deliveryType: 'UNICAST',
            title: 'Onboarding Cancelled',
            message: `Onboarding cancelled due to: ${reason}. ${notes || ''}`,
            relatedModule: 'Recruitment',
            isRead: false,
        });
        await notification.save();

        return {
            success: true,
            message: 'Onboarding cancelled successfully',
            reason,
            onboarding,
        };
    }
    

}