import cryptoTools from "/client/lib/cryptoTools";
import projectController from "../../../../../../lib/controllers/projectController";

Template.publicationItem.helpers({
    //add you helpers here
    refreshScrollbar: function () {
        return Template.currentData().refreshScrollbar
    },
    isDeletable: function () {
        return Template.currentData().publication.createdBy === projectController.getCurrentUserProject(FlowRouter.current().params.projectId).asymEnc_memberId
    },
    showDelete: function () {
        return Template.instance().showDelete.get()
    }
});

Template.publicationItem.events({
    //add your events here
    'click [showDelete]': function (event, instance) {
      event.preventDefault()
      instance.showDelete.set(true)
    },
    'click [deletePublication]': function (event, instance) {
        event.preventDefault()
        instance.data.publication.callMethod("delete", projectController.getAuthInfo(FlowRouter.current().params.projectId), (err) => {
            if (err) {
                console.log(err)
            } else {
                Materialize.toast(__('publicationItem.deleteSuccess'), 6000, 'toastOk')
            }

        })
    }
});

Template.publicationItem.onCreated(function () {
    //add your statement here
    this.showDelete = new ReactiveVar(false)

});

Template.publicationItem.onRendered(function () {
    //add your statement here
});

Template.publicationItem.onDestroyed(function () {
    //add your statement here
});

