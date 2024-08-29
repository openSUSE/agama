use utoipa::openapi::{ComponentsBuilder, InfoBuilder, PathsBuilder};

mod network;
pub use network::NetworkApiDocBuilder;
mod storage;
pub use storage::StorageApiDocBuilder;
mod software;
pub use software::SoftwareApiDocBuilder;
mod l10n;
pub use l10n::L10nApiDocBuilder;
mod questions;
pub use questions::QuestionsApiDocBuilder;
mod manager;
pub use manager::ManagerApiDocBuilder;
mod users;
pub use users::UsersApiDocBuilder;

pub struct ApiDoc;

impl ApiDoc {
    pub fn build() -> utoipa::openapi::OpenApi {
        let info = InfoBuilder::new()
            .title("Agama HTTP API")
            .version("0.1.0")
            .build();

        let paths = PathsBuilder::new()
            .path_from::<super::http::__path_ping>()
            .build();

        let components = ComponentsBuilder::new()
            .schema_from::<super::http::PingResponse>()
            .build();

        let mut openapi = utoipa::openapi::OpenApiBuilder::new()
            .info(info)
            .paths(paths)
            .components(Some(components))
            .build();

        let l10n = L10nApiDocBuilder::build();
        let manager = ManagerApiDocBuilder::build();
        let network = NetworkApiDocBuilder::build();
        let questions = QuestionsApiDocBuilder::build();
        let software = SoftwareApiDocBuilder::build();
        let storage = StorageApiDocBuilder::build();
        let users = UsersApiDocBuilder::build();

        openapi.merge(l10n);
        openapi.merge(manager);
        openapi.merge(network);
        openapi.merge(questions);
        openapi.merge(software);
        openapi.merge(storage);
        openapi.merge(users);
        openapi
    }
}
