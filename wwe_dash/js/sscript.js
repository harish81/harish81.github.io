function del_pl(id) {
    swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this Player!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                firebase.database().ref('players').child(id).remove();
                swal("Player has been deleted!", {
                    icon: "success",
                });
                get_data();
            } else {

            }
        });
}

function del_vi(id) {
    swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this Video!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                firebase.database().ref('videos').child(id).remove();
                swal("Video has been deleted!", {
                    icon: "success",
                });
                get_data();
            } else {

            }
        });
}

function get_data() {
    //get players
    var all_pl = {}
    firebase.database().ref('players').once('value').then(function(snapshot) {
        var i = 1;
        var sel_data = [];
        var plyr_tbl_data = "";
        snapshot.forEach(function(childSnapshot) {
            var childData = childSnapshot.val();
            sel_data.push({ id: i, text: childData.name });

            plyr_tbl_data += "<tr>";
            plyr_tbl_data += "<td class='elip' data-toggle='tooltip' title='" + childData.id + "'>" + childData.id + "</td>";
            plyr_tbl_data += "<td>" + childData.name + "</td>";
            plyr_tbl_data += "<td><img class='img-responsive' width=90 src='" + childData.imgUrl + "' /></td>";
            plyr_tbl_data += "<td><a href='javascript:void(0)' id='pl" + childData.id + "'><i class='fas fa-trash'></i></a> <a href='javascript:void(0)'><i class='fas fa-edit'></i></a></td>";
            plyr_tbl_data += "</tr>";
            i++;


        });
        $("#all_plyr_data").html(plyr_tbl_data);
        $('#sel2_player').select2({
            data: sel_data,
            placeholder: "Select a players"
        });

        snapshot.forEach(function(childSnapshot) {
            var childData = childSnapshot.val();
            //onclick delete player
            $("#pl" + childData.id).click(function() {
                del_pl(childData.id);
            });

        });
        $('#tbl_pl').DataTable();
    });

    //get all videos
    firebase.database().ref('videos').once('value').then(function(snapshot) {
        var vid_tbl_data = "";
        snapshot.forEach(function(childSnapshot) {
            var childData = childSnapshot.val();
            vid_tbl_data += "<tr>";
            vid_tbl_data += "<td class='elip' data-toggle='tooltip' title='" + childData.id + "'>" + childData.id + "</td>";
            vid_tbl_data += "<td>" + childData.title + "</td>";
            vid_tbl_data += "<td><a target='_blank' href='https://www.youtube.com/watch?v=" + childData.video_id + "'>" + childData.video_id + "</a></td>";
            vid_tbl_data += "<td>" + childData.player + "</td>";
            vid_tbl_data += "<td class='elip' data-toggle='tooltip' title='" + childData.tags + "'>" + childData.tags + "</td>";
            vid_tbl_data += "<td>" + childData.ad_date + "</td>";
            vid_tbl_data += "<td><a href='javascript:void(0)' id='vi" + childData.id + "'><i class='fas fa-trash'></i></a> <a href='javascript:void(0)'><i class='fas fa-edit'></i></a></td>";
            vid_tbl_data += "</tr>";
        });
        $("#all_vid_data").html(vid_tbl_data);

        snapshot.forEach(function(childSnapshot) {
            var childData = childSnapshot.val();
            //onclick delete video
            $("#vi" + childData.id).click(function() {
                del_vi(childData.id);
            });

        });
        $('#tbl_vi').DataTable();
    });
}

var config = {
    apiKey: "AIzaSyAhYPZbkaYpG2gcWCvLXH86yrEySQm8JRk",
    authDomain: "wwe-video.firebaseapp.com",
    databaseURL: "https://wwe-video.firebaseio.com",
    projectId: "wwe-video",
    storageBucket: "wwe-video.appspot.com",
    messagingSenderId: "918585216037"
};
firebase.initializeApp(config);

$(document).ready(function() {

    $('[data-toggle="tooltip"]').tooltip();

    $('#sel2_player').select2({
        placeholder: "Select a players"
    });

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            $(".dash-board").css("display", "block");
            $(".login-form").css("display", "none");

            get_data();

        } else {
            $(".dash-board").css("display", "none");
            $(".login-form").css("display", "block");
        }
    });
    $("#logout").click(function() {
        firebase.auth().signOut();
        $(".dash-board").css("display", "none");
        $(".login-form").css("display", "block");
    });
    $("#refresh").click(function() {
        get_data();
    });
    $("#frmLogin").submit(function() {
        firebase.auth().signInWithEmailAndPassword($("#email").val(), $("#password").val()).then(function() {
            $(".dash-board").css("display", "block");
            $(".login-form").css("display", "none");
        }).catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            $("#loginerr").text(errorMessage + "(" + errorCode + ")");
        });
        return false;
    });

    $("#frmPlayer").submit(function() {
        var newPlayer = firebase.database().ref().child('players').push();
        var pl_data = {
            id: newPlayer.key,
            name: $("#pl_name").val(),
            imgUrl: $("#pl_url").val()
        };
        newPlayer.set(pl_data).then(function(snapshot) {
            swal("Good job!", "Player inserted!", "success");
        });
        get_data();
        return false;
    });

    $("#frmVideos").submit(function() {
        var select2_data = "";
        var sel_sel = $('#sel2_player').select2('data');
        sel_sel.forEach(function(item, index) {
            select2_data += item.text + "#";
        });
        select2_data = select2_data.substr(0, select2_data.length - 1);

        firebase.database().ref('videos').once('value').then(function(snapshot) {
            var is_data_exists = false;
            snapshot.forEach(function(childSnapshot) {
                var childData = childSnapshot.val();
                if (childData.video_id == $("#vi_video_id").val().trim()) {
                    is_data_exists = true;
                }
            });
            if (is_data_exists) {
                swal("Error!", "The video already exists!", "error");
            } else {


                var newVideo = firebase.database().ref().child('videos').push();
                var vid_data = {
                    id: newVideo.key,
                    title: $("#vi_title").val(),
                    video_id: $("#vi_video_id").val(),
                    player: select2_data,
                    tags: $("#vi_tags").val().replace(/,/g, '#'),
                    ad_date: moment().format('YYYY-MM-DD hh:mm A')
                };
                newVideo.set(vid_data).then(function(snapshot) {
                    swal("Good job!", "New video inserted!", "success");
                    noti($("#vi_title").val(),"New video available.",$("#vi_video_id").val(),select2_data,moment().format('YYYY-MM-DD hh:mm A'));
                    get_data();
                });


            }
        });
        return false;
    });
});

function noti(title,msg,videoid,players,date_time) {
    $.ajax({
        type: 'POST',
        url: "https://fcm.googleapis.com/fcm/send",
        headers: {
            Authorization: 'key=' + 'AAAA1d_yDCU:APA91bGvC0TLD8faC9o2U2Wuy_WP48JPnqNmgW4r7RvbzT0f0mV39-SCMgNE9VMPDlnAnXw70-cLeljRsTwpCkexu8PghecLNPhwt_1vLQ_8xB4vVabiro9v72oRumwVO8ytr-s2t8aY'
        },
        contentType: 'application/json',
        data: JSON.stringify({ "to": "/topics/wwe_updates", "data": { "title": title, "msg": msg, "video_id": videoid, "players": players, "date_time": date_time } }),
        success: function(response) {
            console.log(response);
        },
        error: function(xhr, status, error) {
            console.log(xhr.error);
        }
    });
}
