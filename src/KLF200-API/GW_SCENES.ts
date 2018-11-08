'use strict';

export enum InitializeSceneConfirmationStatus {
    OK = 0,
    EmptySystemTable,
    OutOfStorage
}

export enum InitializeSceneNotificationStatus {
    OK = 0,
    PartlyOK,
    Error
}

export enum RecordSceneStatus {
    OK = 0,
    RequestFailed,
    NoProductStimulation,
    OutOfStorage
}

export enum RenameSceneStatus {
    OK = 0,
    InvalidSceneIndex,
    NameInUse
}

