#include "UserLoginState.h"
#include "ConnectingMenuState.h"
#include "GameStateManager.h"


UserLoginState::UserLoginState(NetworkedScenarioState::NetworkedScenarioStateCreator scenario_state_creator, std::string game_type, ClientConfiguration configuration)
	: scenario_state_creator_(scenario_state_creator),
	game_type_(game_type),
	configuration_(configuration),
	web_client_(utility::conversions::to_string_t(configuration.user_service))
{
	operation_description_ = "Logging in and connecting to the user service...";
	InitiateUserRequest();
}


UserLoginState::~UserLoginState() = default;

void UserLoginState::Update()
{
	// if the user presses ESC from the main menu, the process will exit.
	if (CP_Input_KeyTriggered(KEY_ESCAPE))
	{
		GameStateManager::ReturnToBaseState();
		return;
	}

	// check to see if the web request is done
	// -- if it is, .get() will not block
	// -- this way, we can draw the screen while we wait...
	if (active_task_.is_done())
	{
		try
		{
			auto connect_response_data = active_task_.get();

			//retrieve the "avatar" field from the connect response data, and store it in configuration_.avatar
			auto avatar_util_str = connect_response_data.at(U("avatar")).as_string();
			configuration_.avatar = utility::conversions::to_utf8string(avatar_util_str);
			//retrieve the "token" field from the connect response data, and store it in configuration_.token
			auto token_util_str = connect_response_data.at(U("token")).as_string();
			configuration_.token = utility::conversions::to_utf8string(token_util_str);
			//retrieve the "game_port" field from the connect response data, and store it in configuration_.game_port
			int port = connect_response_data.at(U("game_port")).as_integer();
			configuration_.game_port = port;


			std::cout << "Connect token session: " << configuration_.token.c_str() << std::endl;
			auto* connecting_state = new ConnectingMenuState(scenario_state_creator_, game_type_, configuration_);
			GameStateManager::ApplyState(connecting_state);
		}
		catch (const std::exception& e)
		{
			std::cout << "Exception from web request: " << e.what() << std::endl << std::flush;
			GameStateManager::ReturnToBaseState();
		}
	}
}


void UserLoginState::Draw()
{
	// draw the description
	CP_Settings_TextSize(30);
	CP_Settings_TextAlignment(CP_TEXT_ALIGN_H_LEFT, CP_TEXT_ALIGN_V_TOP);
	CP_Settings_Fill(CP_Color_Create(255, 255, 255, 255));
	CP_Font_DrawText(operation_description_.c_str(), 0.0f, 0.0f);
}


void UserLoginState::InitiateUserRequest()
{
	//build a json object with the login request data
	auto login_data = web::json::value::parse("{}");
	login_data[U("username")] = web::json::value(utility::conversions::to_string_t(configuration_.username));
	login_data[U("password")] = web::json::value(utility::conversions::to_string_t(configuration_.password));

	//TODO: use web_client_ to perform a series of operations:
	// 1) login to the user service
	active_task_ = web_client_.request(web::http::methods::POST, U("/api/v1/login"), login_data)

		// 2) extract the json from the login response
		.then([](web::http::http_response login_response)
			{
				std::cout << login_response.status_code() << std::endl << std::flush;
				if (login_response.status_code() != web::http::status_codes::OK) {
					throw std::exception("assignment4 server login failed !");
				}
				return login_response.extract_json();
			})

		// 3) call "connect" on the user service
				.then([=](web::json::value login_response_data) mutable
					{
						auto session = login_response_data[U("session")].as_string();
						const std::string session_str = utility::conversions::to_utf8string(session);
						std::cout << "Logged in with session " << session_str << std::endl << std::flush;

						auto connect_data = web::json::value::parse("{}");
						connect_data[U("session")] = web::json::value(session);
						connect_data[U("game_type")] = web::json::value(utility::conversions::to_string_t(game_type_));

						return web_client_.request(web::http::methods::POST, U("api/v1/connect"), connect_data);
					})

						// 4) extract the json from the connect response
						.then([=](web::http::http_response connect_response)
							{
								std::cout << connect_response.status_code() << std::endl << std::flush;
								if (connect_response.status_code() != web::http::status_codes::OK)
								{
									throw std::exception("service authenticated-CONNECT-users failed.");
								}
								return connect_response.extract_json();
							});

					try {
						active_task_.wait();
					}
					catch (const std::exception& e) {
						std::cout << "Error exception: " << e.what() << std::endl << std::flush;
					}
}