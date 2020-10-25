angular.module('homeApp', [])
    .controller('homeCtrl', ['$scope', '$http', function ($scope, $http) {
        // $scope.storage = {};
        $scope.getDiskSize = function () {
            var data = {};
            $http({
                method: 'POST',
                url: 'http://localhost:9115/disk_size',
                headers: { 'Content-Type': 'application/json' },
                data: angular.toJson(data)
            }).then(function onsuccess(response) {
                console.log("Response got", response.data);
                $scope.storage = response.data;
                $('#pieSlice1 .pie').animate({ borderSpacing: 120 }, {
                    step: function (now, fx) {
                        $(this).css('-webkit-transform', 'rotate(' + now + 'deg)');
                        $(this).css('-moz-transform', 'rotate(' + now + 'deg)');
                        $(this).css('transform', 'rotate(' + now + 'deg)');
                    },
                    duration: 'slow'
                }, 'linear');
                $('#pieSlice2 .pie').animate({ borderSpacing: 270 }, {
                    step: function (now, fx) {
                        $(this).css('-webkit-transform', 'rotate(' + now + 'deg)');
                        $(this).css('-moz-transform', 'rotate(' + now + 'deg)');
                        $(this).css('transform', 'rotate(' + now + 'deg)');
                    },
                    duration: 'fast'
                }, 'linear');
                $('#pieSlice3 .pie').animate({ borderSpacing: 210 }, {
                    step: function (now, fx) {
                        $(this).css('-webkit-transform', 'rotate(' + now + 'deg)');
                        $(this).css('-moz-transform', 'rotate(' + now + 'deg)');
                        $(this).css('transform', 'rotate(' + now + 'deg)');
                    },
                    duration: 'faster'
                }, 'linear');
                $scope.getFolders($scope.storage.current_selected.cloud_path);
            });
        }
        $scope.getFolders = function (path) {
            var data = {};
            data.path = path;
            $http({
                method: 'POST',
                url: 'http://localhost:9115/get_folders',
                headers: { 'Content-Type': 'application/json' },
                data: angular.toJson(data)
            }).then(function onsuccess(response) {
                console.log("Response got", response.data);
                $scope.folders = response.data;
            });
        }
        $scope.createFolders = function (folder_name) {
            var data = {};
            data.path = $scope.storage.current_selected.cloud_path;
            data.folder_name = folder_name;
            $http({
                method: 'POST',
                url: 'http://localhost:9115/create_folder',
                headers: { 'Content-Type': 'application/json' },
                data: angular.toJson(data)
            }).then(function onsuccess(response) {
                console.log("Response got", response.data);
                if (response.status == 200) {
                    $scope.new_folder_name = null;
                    $scope.error_message = null;
                    $('#myModal').modal('hide');
                }
                $scope.getFolders($scope.storage.current_selected.cloud_path);
            }).catch(function (error) {
                console.log("Error", error);
                $scope.error_message = error.data;
            });
        }
        $scope.showFolderOpts = function (index) {
            // alert("clicked "+index);
            if (document.getElementsByClassName("folder_options")[index].style.display == "none" || document.getElementsByClassName("folder_options")[index].style.display == "") {
                $('.folder_options').css({ "display": "none" })
                document.getElementsByClassName("folder_options")[index].style.display = "block";
            }
            else {
                $('.folder_options').css({ "display": "none" })
                // document.getElementsByClassName("folder_options")[index].style.display = "none";
            }
        }
        $scope.deleteFolder = function (path) {
            var data = {};
            data.path = path;
            $http({
                method: 'POST',
                url: 'http://localhost:9115/remove_folder',
                headers: { 'Content-Type': 'application/json' },
                data: angular.toJson(data)
            }).then(function onsuccess(response) {
                console.log("Response got", response.data);
                $('.folder_options').css({ "display": "none" })
                $scope.getFolders($scope.storage.current_selected.cloud_path);
            }).catch(function (error) {
                console.log("Error", error);
                $scope.error_message = error.data;
            });
        }

        $scope.loader = false;
        $scope.get_files_of_folder = function (folder_path, folder_name) {
            $scope.loader = true;
            $scope.files_of_folder = [];
            $scope.selected_folder = folder_name;
            $('.folder_options').css({ "display": "none" });
            $('#myModal1').modal('show');
            var data = {};
            data.path = folder_path;
            $http({
                method: 'POST',
                url: 'http://localhost:9115/get_files',
                headers: { 'Content-Type': 'application/json' },
                data: angular.toJson(data)
            }).then(function onsuccess(response) {
                console.log("Response got", response.data);
                $scope.files_of_folder = response.data;
                $scope.loader = false;
            }).catch(function (error) {
                console.log("Error", error);
                $scope.error_message = error.data;
                $scope.loader = false;
            });
        }
        $scope.getAllDisks = function () {
            console.log("Inside getAllDisks");
            var data = {};
            $http({
                method: 'POST',
                url: 'http://localhost:9115/get_all_disks',
                headers: { 'Content-Type': 'application/json' },
                data: angular.toJson(data)
            }).then(function onsuccess(response) {
                console.log("Response got", response.data);
                $scope.all_disks = response.data;
            });
        }
        $scope.createCloud = function () {
            console.log("Inside createCloud");
            var data = {};
            data.cloud_name = $scope.new_cloud_name;
            data.for_location = $scope.for_location_name;
            data.disk_name = $scope.storage_selected;
            $http({
                method: 'POST',
                url: 'http://localhost:9115/create_new_cloud',
                headers: { 'Content-Type': 'application/json' },
                data: angular.toJson(data)
            }).then(function onsuccess(response) {
                console.log("Response got", response.data);
                $('#myModal2').modal('hide');
                $scope.getDiskSize();
                $scope.new_cloud_name = null;
                $scope.for_location_name = null;
                $scope.storage_selected = null;
                // $scope.all_disks = [];
            });
        }
        $scope.active_location = function (cloud_id) {
            console.log("Inside active_location");
            var data = {};
            data.cloud_id = cloud_id;
            $http({
                method: 'POST',
                url: 'http://localhost:9115/activate_cloud',
                headers: { 'Content-Type': 'application/json' },
                data: angular.toJson(data)
            }).then(function onsuccess(response) {
                console.log("Response got", response.data);
                $scope.getDiskSize();
            });
        }
        $scope.logout = function () {
            window.localStorage.clear();
            window.location.href = "./index.html";
        }
        var base_images = [];
        var pics = [];
        $scope.base64 = [];
        $scope.convertToBase64 = function () {
            pics = $('#file').prop('files');
            console.log("Files selected", pics);
            for (var i = 0; i < pics.length; i++) {
                const div = document.createElement('img');
                div.className = "base64";
                document.getElementById('content').appendChild(div);
                console.log("textarea created");
                toDataURL(pics[i], i, function (dataUrl, pos) {
                    console.log('RESULT:', dataUrl.length);
                    setArr(dataUrl, pos);
                })
            }
        }
        function setArr(base, pos) {
            var data = {};
            data.base = base;
            console.log("Request body", data);
            $http({
                method: 'POST',
                url: 'http://localhost:9115/save_images_p_cdn',
                headers: { 'Content-Type': 'application/json' },
                data: angular.toJson(data)
            }).then(function onsuccess(response) {
                console.log("Response got", response.data);
                document.getElementsByClassName("base64")[pos].src = response.data;
            });
        }
        function toDataURL(file, pos, callback) {
            console.log("Inside toDataURL", file)
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
                callback(reader.result, pos)
            };
            reader.onerror = function (error) {
                console.log('Error: ', error);
            };
        }
    }])